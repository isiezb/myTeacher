"""
Parser module for handling and validating LLM responses.

This module handles parsing and validation of LLM response data
for story generation and continuation.
"""

import json
from typing import Dict, Any, List, Optional, Tuple
from models.story import VocabularyItem, QuizItem, StoryGenerationRequest

def parse_json_response(json_string: str) -> Dict[str, Any]:
    """
    Parse a JSON string into a Python dictionary.
    
    Args:
        json_string: JSON string from LLM
        
    Returns:
        Parsed Python dictionary
        
    Raises:
        ValueError: If JSON parsing fails
    """
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM: {e}")
        print(f"Received text: {json_string}")
        raise ValueError("Could not parse the JSON response from the language model.") from e

def validate_story_response(data: Dict[str, Any]) -> None:
    """
    Validate that the story response has the required fields.
    
    Args:
        data: Parsed response data
        
    Raises:
        ValueError: If required fields are missing
    """
    if not all(k in data for k in ["title", "story_content"]):
        raise ValueError("LLM response missing required keys 'title' or 'story_content'.")

def validate_continuation_response(data: Dict[str, Any]) -> None:
    """
    Validate that the continuation response has the required fields.
    
    Args:
        data: Parsed response data
        
    Raises:
        ValueError: If required fields are missing
    """
    if "continuation_text" not in data:
        raise ValueError("LLM response missing required key 'continuation_text'.")

def parse_vocabulary(vocab_data: Any) -> Optional[List[VocabularyItem]]:
    """
    Parse and validate vocabulary data.
    
    Args:
        vocab_data: Raw vocabulary data from LLM
        
    Returns:
        List of VocabularyItem objects or None if parsing fails, limited to 4 items
    """
    if not vocab_data or not isinstance(vocab_data, list):
        return None
        
    try:
        vocabulary_list = []
        for item in vocab_data:
            if isinstance(item, dict) and "term" in item and "definition" in item:
                vocabulary_list.append(VocabularyItem(**item))
                # Limit to 4 vocabulary items
                if len(vocabulary_list) >= 4:
                    break
        
        return vocabulary_list if vocabulary_list else None
    except Exception as e:
        print(f"Warning: Could not parse vocabulary list: {e}")
        return None

def parse_quiz(quiz_data: Any) -> Optional[List[QuizItem]]:
    """
    Parse and validate quiz data.
    
    Args:
        quiz_data: Raw quiz data from LLM
        
    Returns:
        List of QuizItem objects or None if parsing fails
    """
    if not quiz_data or not isinstance(quiz_data, list):
        return None
        
    try:
        quiz_list = []
        for item in quiz_data:
            if isinstance(item, dict) and "question" in item and "options" in item and "correct_answer" in item:
                # Ensure correct_answer is an integer (index)
                if isinstance(item["correct_answer"], int):
                    quiz_list.append(QuizItem(**item))
                elif isinstance(item["correct_answer"], str) and item["correct_answer"].isdigit():
                    item["correct_answer"] = int(item["correct_answer"])
                    quiz_list.append(QuizItem(**item))
        
        return quiz_list if quiz_list else None
    except Exception as e:
        print(f"Warning: Could not parse quiz list: {e}")
        return None

def calculate_word_count(text: str) -> int:
    """
    Calculate the word count of a text.
    
    Args:
        text: String to count words in
        
    Returns:
        Word count
    """
    return len(text.split())

def extract_story_content(data: Dict[str, Any], request: StoryGenerationRequest) -> Tuple[str, int, Optional[List[VocabularyItem]], Optional[List[QuizItem]]]:
    """
    Extract and validate all content from a story generation response.
    
    Args:
        data: Parsed response data
        request: The original request with feature flags
        
    Returns:
        Tuple of (content, word_count, vocabulary_list, quiz_list)
    """
    story_content = data.get("story_content", "")
    word_count = calculate_word_count(story_content)
    
    # Process vocabulary if requested
    vocabulary_list = None
    if request.generate_vocabulary and "vocabulary" in data:
        vocabulary_list = parse_vocabulary(data["vocabulary"])
            
    # Process quiz if requested
    quiz_list = None
    if request.generate_quiz and "quiz" in data:
        quiz_list = parse_quiz(data["quiz"])
            
    return story_content, word_count, vocabulary_list, quiz_list

def extract_continuation_content(data: Dict[str, Any]) -> Tuple[str, int, Optional[List[VocabularyItem]]]:
    """
    Extract and validate all content from a story continuation response.
    
    Args:
        data: Parsed response data
        
    Returns:
        Tuple of (continuation_text, word_count, vocabulary_list)
    """
    continuation_text = data.get("continuation_text", "")
    word_count = calculate_word_count(continuation_text)
    
    # Process vocabulary if present
    vocabulary_list = parse_vocabulary(data.get("vocabulary"))
            
    return continuation_text, word_count, vocabulary_list 