import logging
from fastapi import APIRouter, HTTPException, status, Path, Body, Depends

# Adjust the import path based on the structure (app -> models -> lesson_models)
from ..models.lesson_models import (
    LessonGenerationRequest,
    LessonGenerationResponse,
    LessonContinuationRequest,
    # LessonContinuationResponse # This model does not exist, reuse LessonGenerationResponse
)
# Import the service functions
from ..services import lesson_service

logger = logging.getLogger(__name__)

# Create the router instance. It will be included in main.py with the /api prefix.
# So endpoints here will be accessible like /api/lessons/...
router = APIRouter(
    prefix="/lessons",
    tags=["Lessons"], # Tag for OpenAPI documentation grouping
    responses={404: {"description": "Not found"}}, # Add default 404 response
)

@router.post(
    "/generate",
    response_model=LessonGenerationResponse,
    summary="Generate a New Lesson",
    description="Creates a new educational lesson based on the provided parameters using an AI model, then saves it.",
    status_code=status.HTTP_201_CREATED, # Indicates resource creation
)
async def generate_lesson_endpoint(
    request: LessonGenerationRequest = Body(...)
):
    """
    Endpoint to generate a new educational lesson and save it.
    Receives lesson parameters and returns the generated lesson content.
    """
    logger.info(f"Received lesson generation request: Subject='{request.subject}', Grade='{request.academic_grade}'")
    try:
        # Call the lesson generation service
        generated_lesson = await lesson_service.generate_new_lesson(request)
        logger.info(f"Successfully generated lesson ID: {generated_lesson.id}")

        # Save the generated lesson to the database
        try:
            lesson_id = await lesson_service.save_lesson(generated_lesson)
            logger.info(f"Successfully saved generated lesson with ID: {lesson_id}")
        except Exception as db_error:
            logger.error(f"Failed to save generated lesson for topic {request.topic} to database: {db_error}", exc_info=True)

        return generated_lesson

    except ValueError as ve:
        logger.error(f"Validation or generation error during lesson generation: {ve}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve) # Provide error details from service layer
        )
    except (ConnectionError, TimeoutError) as ce:
        logger.error(f"AI service communication error: {ce}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(ce) # Provide specific comms error
        )
    except Exception as e:
        logger.error(f"Failed to generate lesson: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred while generating the lesson." # Avoid leaking detailed internal errors
        )

@router.post(
    "/continue", # Changed path, no longer needs lesson_id in path
    response_model=LessonGenerationResponse, # Reusing the same response model
    status_code=status.HTTP_200_OK,
    summary="Continue or Modify an Existing Lesson",
    description="Takes the full previous lesson data and user instructions to regenerate the lesson content, then saves the result.",
)
async def continue_lesson_endpoint(request_body: LessonContinuationRequest = Body(...)):
    """
    Continues or modifies an existing lesson based on user prompts and saves the result.

    - **previous_lesson**: The full data structure of the previously generated lesson.
    - **continuation_prompt**: User's specific instructions on how the lesson should be continued or changed (e.g., "Explain the concept of inertia in more detail", "Add a quiz question about the second law").
    """
    if not request_body.previous_lesson or not request_body.continuation_prompt:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing previous lesson data or continuation prompt."
         )

    try:
        logger.info(f"Received lesson continuation request for lesson title: {request_body.previous_lesson.title}")
        # Note: Need to implement continue_lesson_content in the service layer
        result = await lesson_service.continue_lesson_content(request_body)
        logger.info(f"Successfully continued lesson for title: {request_body.previous_lesson.title}")

        # Save the continued lesson to the database
        try:
            lesson_id = await lesson_service.save_lesson(result)
            logger.info(f"Successfully saved continued lesson with ID: {lesson_id}")
        except Exception as db_error:
            logger.error(f"Failed to save continued lesson for title {request_body.previous_lesson.title} to database: {db_error}", exc_info=True)

        return result
    except ValueError as ve:
        logger.error(f"Validation or continuation error during lesson continuation: {ve}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except NotImplementedError as nie:
         logger.error(f"Lesson continuation feature not implemented: {nie}", exc_info=True)
         raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(nie) # Use error message from service if available
         )
    except (ConnectionError, TimeoutError) as ce:
        logger.error(f"AI service communication error during continuation: {ce}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(ce)
        )
    except Exception as e:
        logger.error(f"Failed to continue lesson: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred while continuing the lesson."
        )

# --- TODO: Add endpoints for getting lessons, saving, deleting, etc. ---
# Example:
# @router.get("/{lesson_id}", response_model=LessonGenerationResponse, ...)
# async def get_lesson_endpoint(lesson_id: str = Path(...)):
#     pass

# @router.get("/", response_model=List[LessonSummary], ...) # Need a LessonSummary model
# async def list_lessons_endpoint(...):
#     pass
