"""
Validation utilities for input data.

This module provides validation functions for various inputs
to ensure data consistency and error handling.
"""

from typing import Dict, Any, Optional, List

def validate_api_key(api_key: Optional[str]) -> bool:
    """
    Validate that an API key is present and non-empty.
    
    Args:
        api_key: API key to validate
        
    Returns:
        True if valid, False otherwise
    """
    return bool(api_key and api_key.strip())

def validate_word_count(word_count: int, min_value: int = 50, max_value: int = 2000) -> bool:
    """
    Validate that a word count is within acceptable limits.
    
    Args:
        word_count: Word count to validate
        min_value: Minimum acceptable value
        max_value: Maximum acceptable value
        
    Returns:
        True if valid, False otherwise
    """
    return min_value <= word_count <= max_value

def validate_grade_level(grade: str) -> bool:
    """
    Validate that a grade level is properly formatted.
    
    Args:
        grade: Grade level string (e.g., 'K', '5', '12')
        
    Returns:
        True if valid, False otherwise
    """
    if grade.upper() == 'K':
        return True
        
    try:
        grade_num = int(grade)
        return 1 <= grade_num <= 12
    except ValueError:
        return False

def validate_language(language: str, supported_languages: Optional[List[str]] = None) -> bool:
    """
    Validate that a language is supported.
    
    Args:
        language: Language to validate
        supported_languages: List of supported languages (defaults to English only)
        
    Returns:
        True if valid, False otherwise
    """
    if supported_languages is None:
        supported_languages = ["English"]
        
    return language in supported_languages

def validate_request_fields(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
    """
    Validate that all required fields are present in a request.
    
    Args:
        data: Request data to validate
        required_fields: List of required field names
        
    Returns:
        List of missing field names (empty if all present)
    """
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    return missing_fields 