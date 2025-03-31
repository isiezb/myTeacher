"""
Parser module for handling and validating LLM responses.

This module handles parsing and validation of LLM response data
for story generation and continuation.
"""

import json
from typing import Dict, Any, List, Optional, Tuple
from models.story import VocabularyItem, QuizItem, StoryGenerationRequest

def parse_json_response(json_str: str) -> Dict[str, Any]:
    """
    Parse the JSON response from the LLM.
    
    Args:
        json_str: The JSON string response from the LLM
        
    Returns:
        The parsed JSON as a dictionary
        
    Raises:
        ValueError: If the JSON is invalid
    """
    try:
        # Fix common JSON issues
        cleaned_json_str = json_str.strip()
        # If the string is wrapped in code block markers, remove them
        if cleaned_json_str.startswith("```json") and cleaned_json_str.endswith("```"):
            cleaned_json_str = cleaned_json_str[7:-3].strip()
        elif cleaned_json_str.startswith("```") and cleaned_json_str.endswith("```"):
            cleaned_json_str = cleaned_json_str[3:-3].strip()
        
        return json.loads(cleaned_json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON response from LLM: {e}") from e

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
    Validate the parsed response from the LLM.
    
    Args:
        data: The parsed JSON data from the LLM
        
    Raises:
        ValueError: If the response is missing required fields or has invalid data
    """
    if not isinstance(data, dict):
        raise ValueError("Response must be a JSON object.")
    
    if "continuation_text" not in data:
        raise ValueError("Response missing 'continuation_text' field")
    
    if not isinstance(data["continuation_text"], str):
        raise ValueError("'continuation_text' must be a string")
    
    if len(data["continuation_text"].strip()) == 0:
        raise ValueError("'continuation_text' cannot be empty")
    
    # Check vocabulary if provided
    if "vocabulary" in data and data["vocabulary"] is not None:
        if not isinstance(data["vocabulary"], list):
            raise ValueError("'vocabulary' must be a list of objects")
        
        for item in data["vocabulary"]:
            if not isinstance(item, dict):
                raise ValueError("Each vocabulary item must be an object")
            if "term" not in item or "definition" not in item:
                raise ValueError("Each vocabulary item must have a 'term' and 'definition'")

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

def extract_continuation_content(data: Dict[str, Any]) -> Tuple[str, int, List[Dict[str, str]], Optional[str], Optional[List[Dict[str, Any]]]]:
    """
    Extract the continuation text and other content from the LLM response.
    
    Args:
        data: The parsed and validated JSON data from the LLM
        
    Returns:
        Tuple of (continuation_text, word_count, vocabulary_list, summary, quiz)
    """
    # Extract the continuation text
    continuation_text = data["continuation_text"]
    
    # Calculate the word count
    word_count = len(continuation_text.split())
    
    # Extract vocabulary if available
    vocabulary_list = data.get("vocabulary", [])
    if vocabulary_list is None:
        vocabulary_list = []
    
    # Extract summary if available
    summary = data.get("summary", None)
    
    # Extract quiz if available
    quiz = data.get("quiz", [])
    if quiz is None:
        quiz = []
    
    return continuation_text, word_count, vocabulary_list, summary, quiz 