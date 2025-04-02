"""
Lesson continuation module for extending existing educational lessons.

This module handles the continuation of existing lessons using the LLM
with specified parameters for length and difficulty.
"""

from models.lesson import LessonContinuationRequest, LessonContinuationResponse
from services.llm.client import generate_content
from services.llm.prompting import build_continuation_prompt, get_system_prompt
from services.lesson.parser import (
    parse_json_response, 
    validate_continuation_response,
    extract_continuation_content
)
import logging

async def continue_lesson_content(lesson_id: str, request: LessonContinuationRequest) -> LessonContinuationResponse:
    """
    Generate a continuation for an existing educational lesson.
    
    Args:
        lesson_id: Identifier for the original lesson
        request: Lesson continuation parameters
        
    Returns:
        Continuation response with generated text
        
    Raises:
        ValueError: For validation or parsing errors
        Exception: For API or network errors
    """
    # Validate input
    if not request.original_lesson_content:
        raise ValueError("Original lesson content must be provided if lesson retrieval is not implemented.")
        
    # Build the prompt and schema for the LLM
    prompt, output_format_description = build_continuation_prompt(lesson_id, request)
    system_prompt = get_system_prompt(output_format_description)
    
    # Generate content using the LLM
    result_json_str = await generate_content(
        system_prompt=system_prompt,
        user_prompt=prompt,
        timeout=60.0
    )
    
    # Parse and validate the response
    generated_data = parse_json_response(result_json_str)
    validate_continuation_response(generated_data)
    
    # Extract content from the response
    continuation_text, word_count, vocabulary_list, summary, quiz = extract_continuation_content(generated_data)
    
    # Debug response data
    logger = logging.getLogger(__name__)
    logger.info(f"Extracted continuation data: text_length={len(continuation_text)}, words={word_count}")
    logger.info(f"Vocabulary items: {len(vocabulary_list) if vocabulary_list else 0}")
    logger.info(f"Quiz questions: {len(quiz) if quiz else 0}")
    
    # Build the final response object
    response = LessonContinuationResponse(
        lesson_id=lesson_id,
        continuation_text=continuation_text,
        word_count=word_count,
        difficulty=request.difficulty,
        focus=request.focus or "general",
        vocabulary=vocabulary_list,
        summary=summary,
        quiz=quiz
    )
    
    # Verify response structure
    logger.info(f"Response structure check: vocabulary={response.vocabulary is not None}, quiz={response.quiz is not None}")
    
    return response 