from fastapi import APIRouter, HTTPException, status, Depends, Path
from models.lesson import LessonGenerationRequest, LessonGenerationResponse, LessonContinuationRequest, LessonContinuationResponse
from services import generate_lesson_content, continue_lesson_content, parse_lesson_content
from pydantic import BaseModel
from typing import Optional
import logging

router = APIRouter(
    prefix="/lessons",
    tags=["lessons"],
)

logger = logging.getLogger(__name__)

class LessonRequest(BaseModel):
    grade_level: str
    subject: str
    language: str = "en"
    word_count: int = 500
    generate_vocabulary: bool = True
    generate_summary: bool = True
    generate_quiz: bool = True
    custom_elements: Optional[dict] = None

class LessonContinuationRequest(BaseModel):
    lesson_id: str
    continuation_prompt: Optional[str] = None

@router.post(
    "/generate",
    response_model=LessonGenerationResponse,
    summary="Generate a new educational lesson",
    status_code=status.HTTP_201_CREATED, # Use 201 Created for successful POST
)
async def generate_lesson(request: LessonRequest):
    """Generate a new educational lesson based on the provided parameters."""
    try:
        logger.info(f"Generating lesson for grade {request.grade_level} in {request.subject}")
        
        # Generate the lesson content
        lesson_content = generate_lesson_content(
            grade_level=request.grade_level,
            subject=request.subject,
            language=request.language,
            word_count=request.word_count,
            generate_vocabulary=request.generate_vocabulary,
            generate_summary=request.generate_summary,
            generate_quiz=request.generate_quiz,
            custom_elements=request.custom_elements
        )
        
        # Parse the lesson content
        parsed_lesson = parse_lesson_content(lesson_content)
        
        return parsed_lesson
    except Exception as e:
        logger.error(f"Error generating lesson: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/{lesson_id}/continue",
    response_model=LessonContinuationResponse,
    summary="Continue an existing educational lesson",
    status_code=status.HTTP_201_CREATED,
)
async def continue_lesson(request: LessonContinuationRequest):
    """Continue an existing lesson with additional content."""
    try:
        logger.info(f"Continuing lesson {request.lesson_id}")
        
        # Continue the lesson content
        continued_content = continue_lesson_content(
            lesson_id=request.lesson_id,
            continuation_prompt=request.continuation_prompt
        )
        
        # Parse the continued content
        parsed_lesson = parse_lesson_content(continued_content)
        
        return parsed_lesson
    except Exception as e:
        logger.error(f"Error continuing lesson: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# You can add other lesson-related endpoints here (e.g., get, save, delete) later 