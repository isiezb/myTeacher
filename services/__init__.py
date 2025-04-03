"""
Services module for EasyStory application.

This module exposes the public API for the services layer while abstracting
implementation details of the underlying modules.
"""

# Re-export the main story generation and continuation functions
from services.lesson.generator import generate_lesson_content
from services.lesson.continuation import continue_lesson_content
from services.lesson.parser import parse_lesson_content

# The original services module exposed these two functions,
# so we maintain the same public API for compatibility
__all__ = [
    'generate_lesson_content',
    'continue_lesson_content',
    'parse_lesson_content'
]
