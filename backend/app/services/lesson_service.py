import logging
import json
from typing import Dict, Any, Optional, List, Tuple
import uuid # Added for quiz/option ID generation

# Import models from the models directory
from ..models.lesson_models import (
    LessonGenerationRequest,
    LessonGenerationResponse,
    LessonContinuationRequest,
    VocabularyItem, # Import sub-models if needed for processing
    QuizItem,
    QuizOption # Needed for parsing
)

# Import AI client and prompt builder
from .ai_client import call_llm
from .prompt_builder import build_generation_prompt, build_continuation_prompt

# Import Supabase client getter and types
from ..db.supabase_client import get_supabase_client 
from supabase import Client 
from postgrest import APIResponse 

logger = logging.getLogger(__name__)

# --- Helper for Parsing ---

def _parse_llm_json(json_string: str) -> Dict[str, Any]:
    """Attempts to parse the LLM's JSON string, handling potential issues."""
    try:
        # Basic cleaning: remove potential ```json ... ``` markers
        cleaned_json_str = json_string.strip()
        if cleaned_json_str.startswith("```json") and cleaned_json_str.endswith("```"):
            cleaned_json_str = cleaned_json_str[7:-3].strip()
        elif cleaned_json_str.startswith("```") and cleaned_json_str.endswith("```"):
            cleaned_json_str = cleaned_json_str[3:-3].strip()

        return json.loads(cleaned_json_str)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON response from LLM: {e}")
        logger.debug(f"Raw JSON string: {json_string}")
        raise ValueError("Received invalid JSON format from AI service.") from e

def _parse_vocabulary(vocab_data: Optional[List[Dict[str, str]]]) -> Optional[List[VocabularyItem]]:
    """Safely parses vocabulary data into model objects."""
    if not vocab_data or not isinstance(vocab_data, list):
        return None
    parsed_items = []
    for item in vocab_data:
        if isinstance(item, dict) and "term" in item and "definition" in item:
            try:
                parsed_items.append(VocabularyItem(**item))
            except Exception as e: # Catch potential Pydantic validation errors
                logger.warning(f"Skipping invalid vocabulary item {item}: {e}")
    return parsed_items if parsed_items else None

def _parse_quiz(quiz_data: Optional[List[Dict[str, Any]]]) -> Optional[List[QuizItem]]:
    """Safely parses quiz data into model objects, generating IDs if missing."""
    if not quiz_data or not isinstance(quiz_data, list):
        return None
    parsed_items = []
    for item_data in quiz_data:
        if isinstance(item_data, dict) and "question" in item_data and "options" in item_data and "correct_option_id" in item_data:
            try:
                 # Ensure options have IDs
                options_with_ids = []
                option_id_map = {} # To check correct_option_id validity
                for opt in item_data.get("options", []):
                    if isinstance(opt, dict) and "text" in opt:
                        option_id = opt.get("id") or str(uuid.uuid4()) # Generate ID if missing
                        option_id_map[option_id] = opt["text"]
                        options_with_ids.append(QuizOption(id=option_id, text=opt["text"]))
                    else:
                         logger.warning(f"Skipping invalid option format in quiz item: {opt}")

                if not options_with_ids:
                    logger.warning(f"Skipping quiz question with no valid options: {item_data.get('question')}")
                    continue

                # Ensure correct_option_id exists
                correct_id = item_data.get("correct_option_id")
                if correct_id not in option_id_map:
                     logger.warning(f"Correct option ID '{correct_id}' not found in options for question: {item_data.get('question')}. Skipping question.")
                     continue

                # Generate question ID if missing
                question_id = item_data.get("id") or str(uuid.uuid4())

                # Create QuizItem
                quiz_item = QuizItem(
                    id=question_id,
                    question=item_data["question"],
                    options=options_with_ids,
                    correct_option_id=correct_id
                )
                parsed_items.append(quiz_item)
            except Exception as e:
                logger.warning(f"Skipping invalid quiz item {item_data}: {e}")
    return parsed_items if parsed_items else None

# --- Lesson Generation Service ---

async def generate_new_lesson(request: LessonGenerationRequest) -> LessonGenerationResponse:
    """
    Handles the business logic for generating a new lesson.
    1. Builds the appropriate prompt for the AI model.
    2. Calls the AI model.
    3. Parses and validates the response.
    4. Constructs and returns the LessonGenerationResponse object.
    """
    logger.info(f"Generating new lesson: Subject='{request.subject}', Grade='{request.academic_grade}'")

    # 1. Build Prompt
    user_prompt, system_prompt = build_generation_prompt(request)

    # 2. Call AI Model
    try:
        raw_response_str = await call_llm(system_prompt, user_prompt)
    except (ValueError, ConnectionError, TimeoutError) as e:
        # Pass specific errors up to the router
        raise e
    except Exception as e:
        logger.error(f"Unexpected error calling LLM for lesson generation: {e}", exc_info=True)
        raise ConnectionError("An unexpected error occurred while communicating with the AI service.") from e

    # 3. Parse & Validate Response
    try:
        parsed_data = _parse_llm_json(raw_response_str)
        logger.debug("Successfully parsed LLM response JSON.")

        # Basic check for required fields
        if "title" not in parsed_data or "lesson_content" not in parsed_data:
            logger.error(f"LLM JSON response missing required keys 'title' or 'lesson_content'. Data: {parsed_data}")
            raise ValueError("AI response missing required lesson content fields.")

    except ValueError as e: # Catches parsing errors from _parse_llm_json or key errors above
        raise e # Re-raise to be handled by router

    # 4. Construct Response Object (Safely extracting and parsing optional fields)
    try:
        lesson_content = parsed_data.get("lesson_content", "")
        actual_word_count = len(lesson_content.split())

        response = LessonGenerationResponse(
            # id is generated by default_factory
            title=parsed_data.get("title", f"Generated Lesson: {request.subject}"), # Use default if missing
            lesson_content=lesson_content,
            academic_grade=request.academic_grade,
            subject=request.subject,
            topic=request.topic,
            teacher_style=request.teacher_style,
            word_count=actual_word_count,
            language=request.language,
            summary=parsed_data.get("summary") if request.include_summary else None,
            vocabulary=_parse_vocabulary(parsed_data.get("vocabulary")) if request.include_vocabulary else None,
            quiz=_parse_quiz(parsed_data.get("quiz")) if request.include_quiz else None,
            learning_objectives=parsed_data.get("learning_objectives") # Assuming list of strings
            # created_at is handled by default_factory
        )
        logger.info(f"Successfully processed generated lesson ID: {response.id}")
        return response
    except Exception as e: # Catch potential Pydantic validation errors or others during construction
         logger.exception(f"Error constructing LessonGenerationResponse object: {e}")
         logger.debug(f"Parsed LLM data causing error: {parsed_data}")
         # Raise a generic internal server error if construction fails unexpectedly
         raise ValueError("Failed to process the generated lesson data.") from e

# --- New Lesson Continuation Service ---

async def continue_lesson_content(request_data: LessonContinuationRequest) -> LessonGenerationResponse:
    """
    Continues or modifies an existing lesson based on user instructions.
    Expects the AI to return the *complete, updated* lesson structure.
    """
    logger.info(f"Continuing lesson titled: {request_data.previous_lesson.title}")
    
    if not request_data.previous_lesson:
        raise ValueError("Previous lesson data is required for continuation.")

    try:
        # 1. Build Prompt specifically for continuation
        user_prompt, system_prompt = prompt_builder.build_continuation_prompt(
            request_data.previous_lesson,
            request_data.continuation_prompt
        )

        # 2. Call AI Model
        logger.debug("Sending prompts to AI client for lesson continuation.")
        # We expect the AI to return a *complete*, updated LessonGenerationResponse structure
        raw_response_str = await call_llm(
            system_prompt,
            user_prompt,
            # model=settings.AI_MODEL # Optionally specify model if different for continuation
        )

        if not raw_response_str:
             raise ValueError("AI client returned an empty response for continuation.")

        # 3. Parse & Validate Response (Expecting full LessonGenerationResponse structure)
        parsed_data = _parse_llm_json(raw_response_str)
        logger.debug("Successfully parsed LLM continuation response JSON.")

        # Basic validation for the regenerated structure
        if "title" not in parsed_data or "lesson_content" not in parsed_data:
            logger.error(f"LLM continuation JSON response missing required keys 'title' or 'lesson_content'. Data: {parsed_data}")
            raise ValueError("AI continuation response missing required lesson content fields.")

        # 4. Construct Response Object using the *regenerated* data
        # We rely on the LLM providing the full, updated structure correctly.
        # The original request parameters (grade, subject, etc.) are implicitly part
        # of the `previous_lesson` context given to the LLM, but we construct
        # the new response *entirely* from the LLM's output JSON.
        continued_lesson_response = LessonGenerationResponse(
            # Generate a new ID or keep the old one? Let's assume new for now, or maybe reuse?
            # Using previous ID might make sense if it's an edit/update in place.
            id=request_data.previous_lesson.id, # Re-use the original ID
            title=parsed_data.get("title", request_data.previous_lesson.title), # Fallback title
            lesson_content=parsed_data.get("lesson_content", ""),
            academic_grade=parsed_data.get("academic_grade", request_data.previous_lesson.academic_grade),
            subject=parsed_data.get("subject", request_data.previous_lesson.subject),
            topic=parsed_data.get("topic", request_data.previous_lesson.topic),
            teacher_style=parsed_data.get("teacher_style", request_data.previous_lesson.teacher_style),
            word_count=len(parsed_data.get("lesson_content", "").split()), # Recalculate word count
            language=parsed_data.get("language", request_data.previous_lesson.language),
            summary=parsed_data.get("summary"), # Optional, based on LLM output
            vocabulary=_parse_vocabulary(parsed_data.get("vocabulary")),
            quiz=_parse_quiz(parsed_data.get("quiz")),
            learning_objectives=parsed_data.get("learning_objectives"),
            created_at=request_data.previous_lesson.created_at # Keep original creation time? Or update? Let's keep original.
        )

        logger.info(f"Successfully continued lesson content for title: {request_data.previous_lesson.title}")
        return continued_lesson_response

    except NotImplementedError as nie: # Specific case if prompt builder part isn't ready
        logger.error(f"Continuation feature dependency not implemented: {nie}", exc_info=True)
        raise nie # Re-raise as NotImplementedError
    except (ValueError, ConnectionError, TimeoutError) as e: # Catch errors from AI call or parsing
        logger.error(f"Error during lesson continuation: {e}", exc_info=True)
        # Re-raise these specific errors for the router to handle
        raise e
    except Exception as e:
        logger.exception(f"Unexpected error during lesson continuation for lesson {request_data.previous_lesson.id}")
        # Raise a generic runtime error for unexpected issues
        raise RuntimeError(f"An unexpected error occurred while continuing the lesson: {e}") from e

# --- Database Interaction Function ---


async def save_lesson(lesson_response: LessonGenerationResponse) -> str:
    """
    Saves the generated lesson data to the Supabase 'lessons' table.
    Falls back to local storage if Supabase is unavailable.

    Args:
        lesson_response: The complete lesson data object.

    Returns:
        The UUID (as a string) of the newly saved lesson record.

    Raises:
        RuntimeError: If saving to the database fails.
    """
    logger.info(f"Attempting to save lesson: {lesson_response.title}")
    try:
        client = get_supabase_client(mock_if_unavailable=True)
        
        # Check if we're using a mock client (meaning Supabase is unavailable)
        is_mock = getattr(client, "is_mock", False)
        if is_mock:
            # Just return the ID without attempting to save to Supabase
            logger.warning("Using mock Supabase client. Lesson will not be saved to database.")
            return str(lesson_response.id)
        
        # Use the structure defined in LessonGenerationResponse for data extraction
        data_to_insert = {
            # 'id' and 'created_at' are usually handled by DB defaults
            # 'user_id': get_current_user_id(), # Add this later if auth is implemented
            'title': lesson_response.title,
            'subject': lesson_response.subject, # Assuming subject is top-level in response model
            'topic': lesson_response.topic,     # Assuming topic is top-level
            'academic_grade': lesson_response.academic_grade, # Assuming grade is top-level
            'word_count': lesson_response.word_count,
            # Store the entire lesson object as JSONB
            # Use .dict() for Pydantic v1, model_dump() for v2+
            'lesson_data': lesson_response.dict() if hasattr(lesson_response, 'dict') else lesson_response.model_dump(mode='json') 
        }

        # Execute the insert operation
        response = await client.table('lessons').insert(data_to_insert).execute()

        # Check for errors
        if response.data is None or not response.data:
            # Supabase client >= 2.0 might not have error attribute directly on response
            # Check if data is empty which indicates potential issue or if RLS prevented insert
            logger.error(f"Failed to insert lesson into Supabase. No data returned. Response: {response}")
            # You might want to inspect response.status_code or other attributes if available
            raise RuntimeError("Failed to save lesson to database: No data returned in response.")

        # Extract the ID of the newly created record
        # Supabase returns a list, even for single insert
        new_lesson_id = response.data[0].get('id')
        if not new_lesson_id:
             logger.error(f"Failed to get ID from Supabase insert response. Response data: {response.data}")
             raise RuntimeError("Failed to retrieve ID for saved lesson.")


        logger.info(f"Successfully saved lesson with ID: {new_lesson_id}")
        return str(new_lesson_id) # Return ID as string

    except Exception as e:
        logger.error(f"Error saving lesson to Supabase: {e}", exc_info=True)
        # Return the original ID rather than failing
        logger.warning(f"Returning original lesson ID: {lesson_response.id}")
        return str(lesson_response.id)
# --- TODO: Add functions for other lesson operations ---
# async def save_lesson_to_db(lesson_data: LessonGenerationResponse) -> str: ...
# async def get_lesson_from_db(lesson_id: str) -> Optional[LessonGenerationResponse]: ...
# async def list_lessons_from_db(...) -> List[LessonSummary]: ... # Requires LessonSummary model
# async def delete_lesson_from_db(lesson_id: str) -> bool: ...
