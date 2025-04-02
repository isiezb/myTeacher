"""
Core lesson generator module for creating educational lessons.

This module handles the main lesson generation process using
the LLM client and prompt generators.
"""

from models.lesson import LessonGenerationRequest, LessonGenerationResponse
from services.llm.client import generate_content
from services.llm.prompting import build_lesson_generation_prompt, get_system_prompt
from services.lesson.parser import (
    parse_json_response, 
    validate_lesson_response,
    extract_lesson_content
)

async def generate_lesson_content(request: LessonGenerationRequest) -> LessonGenerationResponse:
    """
    Generate a complete educational lesson based on the provided parameters.
    
    Args:
        request: Lesson generation parameters and options
        
    Returns:
        Complete lesson response with all requested components
        
    Raises:
        ValueError: For validation or parsing errors
        Exception: For API or network errors
    """
    # Build the prompt and schema for the LLM
    prompt, output_format_description = build_lesson_generation_prompt(request)
    system_prompt = get_system_prompt(output_format_description)
    
    # Generate content using the LLM
    result_json_str = await generate_content(
        system_prompt=system_prompt,
        user_prompt=prompt,
        timeout=90.0  # Longer timeout for lesson generation
    )
    
    # Parse and validate the response
    generated_data = parse_json_response(result_json_str)
    validate_lesson_response(generated_data)
    
    # Extract content from the response
    lesson_content, word_count, vocabulary_list, quiz_list = extract_lesson_content(
        generated_data, request
    )
    
    # Build the final response object
    return LessonGenerationResponse(
        title=generated_data.get("title", "Generated Lesson"),
        content=lesson_content,
        academic_grade=request.academic_grade,
        subject=request.subject,
        word_count=word_count,
        language=request.language,
        summary=generated_data.get("summary") if request.generate_summary else None,
        vocabulary=vocabulary_list,
        quiz=quiz_list,
        learning_objectives=generated_data.get("learning_objectives")
    ) 