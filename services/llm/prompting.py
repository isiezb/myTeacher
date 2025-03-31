"""
Prompt generation utilities for creating effective LLM prompts.

This module contains functions for building prompts for story generation and continuation.
"""

import json
from typing import Tuple, Dict, Any
from models.story import StoryGenerationRequest, StoryContinuationRequest

def build_story_generation_prompt(request: StoryGenerationRequest) -> Tuple[str, str]:
    """
    Build the prompt and output schema for story generation.
    
    Args:
        request: Story generation request parameters
        
    Returns:
        Tuple of (prompt_text, output_format_description)
    """
    subject_display = request.other_subject if request.subject == 'other' and request.other_subject else request.subject

    # Handle university grade level specially
    if request.academic_grade.lower() == 'university':
        audience_line = "Target Audience: University students."
    else:
        audience_line = f"Target Audience: Grade {request.academic_grade} students."

    prompt_lines = [
        f"Generate an educational story in {request.language}.",
        audience_line,
        f"Subject: {subject_display}.",
    ]
    
    if request.subject_specification:
        prompt_lines.append(f"Specific Topic Focus: {request.subject_specification}.")
    if request.setting:
        prompt_lines.append(f"Story Setting: {request.setting}.")
    if request.main_character:
        prompt_lines.append(f"Main Character: {request.main_character}.")

    prompt_lines.append(f"Approximate Word Count: {request.word_count} words.")
    prompt_lines.append("The story should be engaging, age-appropriate, and educational, subtly teaching concepts related to the subject.")
    prompt_lines.append("\nRequirements:")
    prompt_lines.append("- Generate a compelling title.")
    prompt_lines.append("- Generate the main story content. Use double line breaks '\\n\\n' between paragraphs.")

    output_schema = get_story_output_schema(request)
    prompt_lines.append("\nOutput the entire result as a single JSON object conforming exactly to the specified structure.")

    # Convert schema to a string description
    output_format_description = json.dumps(output_schema, indent=2)

    return "\n".join(prompt_lines), output_format_description

def get_story_output_schema(request: StoryGenerationRequest) -> Dict[str, Any]:
    """
    Build the output schema based on request parameters.
    
    Args:
        request: Story generation request with feature flags
        
    Returns:
        Dictionary describing the expected output format
    """
    output_schema = {
        "title": "string (Compelling title for the story)",
        "story_content": "string (The full story text, with paragraphs separated by double line breaks '\\n\\n')",
        "learning_objectives": "[string] (Optional: 3-5 bullet points outlining potential educational takeaways)"
    }

    if request.generate_summary:
        output_schema["summary"] = "string (Concise 2-3 sentence summary)"

    if request.generate_vocabulary:
        output_schema["vocabulary"] = '[{"term": "string", "definition": "string"}] (List of 4 vocabulary words and definitions)'

    if request.generate_quiz:
        output_schema["quiz"] = '[{"question": "string", "options": ["string"], "correct_answer": int}] (List of quiz questions, each with an array of 4 options and the index of the correct answer (0-3))'

    return output_schema

def build_continuation_prompt(story_id: str, request: StoryContinuationRequest) -> Tuple[str, str]:
    """
    Build the prompt and output schema for story continuation.
    
    Args:
        story_id: ID of the original story
        request: Story continuation request parameters
        
    Returns:
        Tuple of (prompt_text, output_format_description)
    """
    difficulty_instructions = {
        "much_easier": "Use significantly simpler vocabulary and sentence structure. Reduce complexity considerably.",
        "slightly_easier": "Use slightly simpler vocabulary and somewhat less complex sentences.",
        "same_level": "Maintain the same level of vocabulary and sentence complexity as the original story.",
        "slightly_harder": "Use slightly more advanced vocabulary and somewhat more complex sentences.",
        "much_harder": "Use significantly more advanced vocabulary and more complex sentence structures."
    }
    
    difficulty_instruction = difficulty_instructions.get(
        request.difficulty, 
        "Maintain the same level of vocabulary and sentence complexity as the original story."
    )
    
    # Handle focus instructions
    focus_instruction = ""
    if request.focus and request.focus != "general":
        focus_instruction = f"""
Focus: Make '{request.focus}' a central theme in this continuation.
- Introduce '{request.focus}' early in the continuation
- Explain the concept of '{request.focus}' in a clear, educational way
- Demonstrate practical examples of '{request.focus}' within the story's context
- Have characters discuss or engage directly with '{request.focus}'
- Make '{request.focus}' essential to resolving a challenge or advancing the narrative
- Revisit '{request.focus}' in the conclusion to reinforce its importance

This focus term is explicitly selected by the user as a learning priority, so make it unmistakably central to the continuation.
"""
    
    prompt_lines = [
        f"Continue the following educational story with approximately {request.length} more words.",
        f"Difficulty adjustment: {difficulty_instruction}",
        "Ensure the continuation flows naturally from the original story and maintains the educational themes.",
        focus_instruction,
        "\nOriginal Story:",
        f"{request.original_story_content}",
        "\nRequirements:",
        "- Generate a natural continuation of the story that picks up exactly where the original left off.",
        "- Maintain consistent characters, setting, and educational themes.",
        "- Include 3-5 relevant vocabulary items that align with the specified difficulty level."
    ]

    output_schema = {
        "continuation_text": "string (The continuation of the story, with paragraphs separated by double line breaks '\\n\\n')",
        "vocabulary": '[{"term": "string", "definition": "string"}] (List of 4 vocabulary words used in the continuation)',
        "quiz": '[{"question": "string", "options": ["string"], "correct_answer": int}] (List of 3-5 quiz questions with multiple-choice options and correct answer index)'
    }

    # If summary was requested, include it in the output schema
    if hasattr(request, 'generate_summary') and request.generate_summary:
        output_schema["summary"] = "string (A concise 2-3 sentence summary of the continuation)"

    # Convert schema to a string description
    output_format_description = json.dumps(output_schema, indent=2)

    return "\n".join(prompt_lines), output_format_description

def get_system_prompt(output_format_description: str) -> str:
    """
    Create the system prompt with format instructions.
    
    Args:
        output_format_description: JSON schema description
        
    Returns:
        Formatted system prompt
    """
    return f"You are an expert educational storyteller. Generate content exactly in the JSON format described below:\n{output_format_description}" 