from fastapi import APIRouter, HTTPException, status, Depends, Path
from models.story import StoryGenerationRequest, StoryGenerationResponse, StoryContinuationRequest, StoryContinuationResponse
from services.story_generator import generate_story_content, continue_story_content
import logging

router = APIRouter(
    prefix="/stories",
    tags=["stories"],
)

logger = logging.getLogger(__name__)

@router.post(
    "/generate",
    response_model=StoryGenerationResponse,
    summary="Generate a new educational story",
    status_code=status.HTTP_201_CREATED, # Use 201 Created for successful POST
)
async def generate_new_story(
    request: StoryGenerationRequest,
):
    """
    Takes story requirements and generates a new educational story using an LLM.
    """
    logger.info(f"Received story generation request for subject: {request.subject}, grade: {request.academic_grade}")
    try:
        generated_story = await generate_story_content(request)
        logger.info(f"Successfully generated story titled: {generated_story.title}")
        return generated_story
    except ValueError as ve:
        logger.error(f"Validation error during story generation: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.exception("An unexpected error occurred during story generation.") # Logs the full traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate story: {str(e)}",
        )

@router.post(
    "/{story_id}/continue",
    response_model=StoryContinuationResponse,
    summary="Continue an existing educational story",
    status_code=status.HTTP_201_CREATED,
)
async def continue_story(
    story_id: str = Path(..., description="The ID of the story to continue"),
    request: StoryContinuationRequest = None,
):
    """
    Takes an existing story and generates a continuation with specified length and difficulty.
    """
    if request is None:
        request = StoryContinuationRequest()  # Use defaults if no request body
        
    logger.info(f"Received story continuation request for story ID: {story_id}, difficulty: {request.difficulty}")
    try:
        continuation = await continue_story_content(story_id, request)
        logger.info(f"Successfully generated story continuation of {continuation.word_count} words")
        return continuation
    except ValueError as ve:
        logger.error(f"Validation error during story continuation: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.exception("An unexpected error occurred during story continuation.") # Logs the full traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to continue story: {str(e)}",
        )

# You can add other story-related endpoints here (e.g., get, save, delete) later 