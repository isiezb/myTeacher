from fastapi import APIRouter, HTTPException, status, Depends, Path
from models.lesson import LessonGenerationRequest, LessonGenerationResponse, LessonContinuationRequest, LessonContinuationResponse
from services.lesson.generator import generate_lesson_content, continue_lesson_content
import logging

router = APIRouter(
    prefix="/lessons",
    tags=["lessons"],
)

logger = logging.getLogger(__name__)

@router.post(
    "/generate",
    response_model=LessonGenerationResponse,
    summary="Generate a new educational lesson",
    status_code=status.HTTP_201_CREATED, # Use 201 Created for successful POST
)
async def generate_new_lesson(
    request: LessonGenerationRequest,
):
    """
    Takes lesson requirements and generates a new educational lesson using an LLM.
    """
    logger.info(f"Received lesson generation request for subject: {request.subject}, grade: {request.academic_grade}")
    try:
        generated_lesson = await generate_lesson_content(request)
        logger.info(f"Successfully generated lesson titled: {generated_lesson.title}")
        return generated_lesson
    except ValueError as ve:
        logger.error(f"Validation error during lesson generation: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.exception("An unexpected error occurred during lesson generation.") # Logs the full traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate lesson: {str(e)}",
        )

@router.post(
    "/{lesson_id}/continue",
    response_model=LessonContinuationResponse,
    summary="Continue an existing educational lesson",
    status_code=status.HTTP_201_CREATED,
)
async def continue_lesson(
    lesson_id: str = Path(..., description="The ID of the lesson to continue"),
    request: LessonContinuationRequest = None,
):
    """
    Takes an existing lesson and generates a continuation with specified length and difficulty.
    """
    if request is None:
        request = LessonContinuationRequest()  # Use defaults if no request body
        
    logger.info(f"Received lesson continuation request for lesson ID: {lesson_id}, difficulty: {request.difficulty}, focus: {request.focus}")
    try:
        continuation = await continue_lesson_content(lesson_id, request)
        logger.info(f"Successfully generated lesson continuation of {continuation.word_count} words with focus on '{continuation.focus}'")
        return continuation
    except ValueError as ve:
        logger.error(f"Validation error during lesson continuation: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.exception("An unexpected error occurred during lesson continuation.") # Logs the full traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to continue lesson: {str(e)}",
        )

# You can add other lesson-related endpoints here (e.g., get, save, delete) later 