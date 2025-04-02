import json
import logging
from typing import Tuple, Dict, Any, Optional, List

# Import models from the models directory
from ..models.lesson_models import (
    LessonGenerationRequest,
    LessonContinuationRequest,
    QuizItem, # Needed for schema definition
    VocabularyItem, # Needed for schema definition
    LessonGenerationResponse
)

logger = logging.getLogger(__name__)

# --- System Prompt --- 

def build_system_prompt() -> str:
    """Builds the system prompt for the AI assistant, emphasizing JSON output."""
    # Define the schema structure clearly for the LLM
    # Use triple quotes for the main string to avoid escaping issues with internal quotes
    schema_description = {
        "title": "string (Clear and engaging title for the lesson, max 15 words)",
        "lesson_content": "string (The full lesson text, well-structured using Markdown (headings, lists, bold). Use paragraphs separated by double line breaks '\\\\n\\\\n'. Adhere strictly to the requested word count.)", # Double escaped newline
        "learning_objectives": "[string] (List of 3-5 specific, measurable learning objectives starting with action verbs)",
        "summary": "string (Optional: Concise 2-3 sentence summary of the core concepts covered)",
        # Use single quotes inside the double-quoted string for inner JSON keys/values if needed, or escape double quotes
        "vocabulary": "[{\"term\": \"string\", \"definition\": \"string\"}] (Optional: List of 3-5 key vocabulary words/phrases introduced in the lesson with simple, grade-appropriate definitions)",
        "quiz": "[{\"id\": \"uuid_string\", \"question\": \"string\", \"options\": [{\"id\": \"uuid_string\", \"text\": \"string\"}], \"correct_option_id\": \"uuid_string\"}] (Optional: List of 3-5 multiple-choice questions based *only* on the lesson content. Each question should have 3-4 unique options. Provide unique UUIDs for 'id' fields. Ensure correct_option_id matches one of the option ids.)",
        "academic_grade": "string (Echo the requested grade level)",
        "subject": "string (Echo the requested subject)",
        "topic": "string (Optional: Echo the requested topic)",
        "teacher_style": "string (Echo the requested style)",
        "language": "string (Echo the requested language)",
        "word_count": "integer (The actual approximate word count of the generated 'lesson_content')"
    }
    schema_json = json.dumps(schema_description, indent=2)

    # Use triple quotes for the f-string to simplify handling of internal quotes and newlines
    return f"""You are an expert educational content creator AI.
Your goal is to generate clear, engaging, and structured lessons based on user requirements.
Your response MUST be a single, valid JSON object that strictly adheres to the schema description below.
Do not include any text, comments, or explanations outside of the JSON object.
Ensure all fields specified in the schema description are present if requested by the user prompt (summary, vocabulary, quiz).
If a field is optional and not requested, omit it from the JSON.
Use Markdown for the 'lesson_content' field.
Generate unique UUIDs for quiz question IDs and option IDs.
Recalculate and provide the actual 'word_count' based on the generated 'lesson_content'.
Echo back the 'academic_grade', 'subject', 'topic', 'teacher_style', and 'language' as provided in the user request.

JSON Output Schema Description:
{schema_json}
"""

# --- System Prompt ---

def _build_base_output_schema(request: LessonGenerationRequest) -> Dict[str, Any]:
    """Builds the core JSON schema expected from the LLM for lesson generation."""
    schema = {
        "title": "string (Clear and engaging title for the lesson)",
        "lesson_content": "string (The full lesson text, well-structured using Markdown, in the specified teacher's style. Use paragraphs separated by double line breaks '\\n\\n'. )",
        "learning_objectives": "[string] (3-5 bullet points outlining key learning takeaways)"
    }
    if request.include_summary:
        schema["summary"] = "string (Concise 2-3 sentence summary of the lesson)"
    if request.include_vocabulary:
        schema["vocabulary"] = '[{"term": "string", "definition": "string"}] (List of 3-5 key vocabulary words/phrases from the lesson with simple definitions)'
    if request.include_quiz:
        # Describe the QuizItem structure within the schema description
        schema["quiz"] = '[{"id": "uuid_string", "question": "string", "options": [{"id": "uuid_string", "text": "string"}], "correct_option_id": "uuid_string"}] (List of 3-5 multiple-choice questions based on the lesson content. Ensure correct_option_id matches one of the option ids.)'
    return schema

def build_generation_prompt(request: LessonGenerationRequest) -> Tuple[str, str]:
    """
    Builds the user prompt and the system prompt (including schema) for lesson generation.

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    logger.debug(f"Building generation prompt for subject: {request.subject}, grade: {request.academic_grade}")

    system_prompt = build_system_prompt() # Use the unified system prompt

    # Define teacher personalities/styles
    teacher_styles = {
        "Encouraging": "warm, encouraging, slightly informal, uses analogies and real-world examples, focuses on building understanding and confidence.",
        "Structured": "clear, structured, precise, step-by-step explanations, emphasizes key concepts and definitions, slightly more formal.",
        "Creative": "imaginative, uses storytelling or creative scenarios, connects concepts in unexpected ways, more conversational.",
        "Direct": "concise, to-the-point, focuses on essential information and facts, minimal fluff."
    }
    style_description = teacher_styles.get(request.teacher_style, 'a standard, clear educational style.')

    # Build user prompt parts
    prompt_lines = [
        f"Generate an educational lesson in {request.language} with a {request.teacher_style} teacher style.",
        f"Teacher Style Description: {style_description}",
        f"Target Audience: Grade {request.academic_grade} students.",
        f"Subject: {request.subject}.",
    ]
    if request.topic:
        prompt_lines.append(f"Specific Topic: {request.topic}.")
    prompt_lines.append(f"Approximate Lesson Length: {request.word_count} words for the main content.")
    prompt_lines.append(f"Explain the core concepts clearly and engagingly in the specified teacher's style.")
    prompt_lines.append(f"Structure the lesson logically (e.g., introduction, explanation(s), examples, conclusion). Use Markdown.")
    prompt_lines.append(f"Address the student directly (e.g., using 'you').")

    # Explicitly state optional requirements based on request flags
    requirements = []
    if request.include_summary:
        requirements.append("- Include a concise summary (field 'summary').")
    if request.include_vocabulary:
        requirements.append("- Include 3-5 key vocabulary terms with definitions (field 'vocabulary').")
    if request.include_quiz:
        requirements.append("- Include 3-5 multiple-choice quiz questions (3-4 options each) based on the content (field 'quiz').")

    if requirements:
        prompt_lines.append("\nInclude the following optional components:")
        prompt_lines.extend(requirements)

    if request.user_prompt_addition:
         prompt_lines.append(f"\nAdditional User Instructions/Context:\n{request.user_prompt_addition}")

    prompt_lines.append("\nRemember to provide your response *only* as a single, valid JSON object adhering exactly to the schema described in the system prompt, including echoing back the requested parameters.")

    user_prompt = "\n".join(prompt_lines)

    logger.debug(f"Generated User Prompt (Generation):\n{user_prompt[:500]}...")
    logger.debug(f"Generated System Prompt (Generation):\n{system_prompt[:500]}...")

    # Return system prompt first, then user prompt, as per ai_client convention
    return system_prompt, user_prompt


# --- Prompt Continuation Logic ---

def _build_continuation_output_schema(request: LessonContinuationRequest) -> Dict[str, Any]:
    """Builds the JSON schema for lesson continuation."""
    schema = {
        "continuation_content": "string (The continuation text, flowing naturally from the original, using Markdown.)",
    }
    if request.include_summary:
        schema["summary"] = "string (Concise 2-3 sentence summary of *only* the continuation part.)"
    if request.include_vocabulary:
         schema["vocabulary"] = '[{"term": "string", "definition": "string"}] (List of 3-5 *new* key vocabulary words/phrases introduced in the continuation with simple definitions)'
    if request.include_quiz:
         schema["quiz"] = '[{"id": "uuid_string", "question": "string", "options": [{"id": "uuid_string", "text": "string"}], "correct_option_id": "uuid_string"}] (List of 3-5 multiple-choice questions based *only* on the continuation content.)'
    return schema

def build_continuation_prompt(previous_lesson: LessonGenerationResponse, continuation_request_prompt: str) -> Tuple[str, str]:
    """
    Builds the user prompt and system prompt for continuing or modifying an existing lesson.
    The system prompt remains the same, instructing the AI to output the full updated JSON.

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    logger.debug(f"Building continuation prompt for lesson: {previous_lesson.title}")

    system_prompt = build_system_prompt() # Reuse the same system prompt

    # Serialize the previous lesson to JSON string to provide context
    try:
        # Use Pydantic's serialization for reliable representation
        previous_lesson_json = previous_lesson.model_dump_json(indent=2)
    except Exception as e:
        logger.error(f"Failed to serialize previous lesson to JSON: {e}", exc_info=True)
        # Fallback to basic dict conversion might lose info or fail on datetime
        try:
            previous_lesson_json = json.dumps(previous_lesson.model_dump(), indent=2, default=str)
        except Exception as inner_e:
             logger.error(f"Fallback serialization also failed: {inner_e}", exc_info=True)
             previous_lesson_json = "{\"error\": \"Could not serialize previous lesson\"}" # Provide minimal JSON

    # Use triple quotes for the f-string to simplify handling of internal quotes and newlines
    user_prompt = f"""You are tasked with continuing or modifying an existing lesson based on user instructions.

Here is the complete data of the PREVIOUS lesson in JSON format:
```json
{previous_lesson_json}
```

The user's specific request for continuation/modification is:
"""
{continuation_request_prompt}
"""

Your task is to regenerate the ENTIRE lesson structure based on the user's request. Apply the requested changes or additions to the previous lesson content, summary, vocabulary, and quiz, while maintaining consistency with the original lesson's style and parameters (grade, subject, topic, style, language) unless the user explicitly asks to change them.

You MUST output the *complete, updated* lesson as a single, valid JSON object that strictly adheres to the LessonGenerationResponse schema described in the system prompt.
- Do NOT just output the changes or the new parts. Output the full revised lesson structure.
- Ensure all required fields (title, lesson_content, etc.) and any requested optional fields (summary, vocab, quiz) are present and correctly formatted.
- Use Markdown for the 'lesson_content' field.
- Recalculate the 'word_count' based *only* on the new/updated 'lesson_content'.
- If adding new quiz questions or vocabulary, ensure they have unique IDs (generate new UUIDs).
- If modifying existing content, update the summary, vocabulary, and quiz accordingly to reflect the changes accurately.
- Echo back the original lesson's parameters (academic_grade, subject, topic, teacher_style, language) in the appropriate fields of the output JSON, unless the user requested a change to these.

    Remember to output ONLY the single, valid JSON object adhering to the schema."""

    logger.debug(f"Generated User Prompt (Continuation):\n{user_prompt[:500]}...")
    logger.debug(f"Generated System Prompt (Continuation):\n{system_prompt[:500]}...")

    # Return system prompt first, then user prompt
    return system_prompt, user_prompt
