"""
Services module for EasyStory application.

This module exposes the public API for the services layer while abstracting
implementation details of the underlying modules.
"""

# Re-export the main story generation and continuation functions
from services.story.generator import generate_story_content
from services.story.continuation import continue_story_content

# The original services module exposed these two functions,
# so we maintain the same public API for compatibility
__all__ = ['generate_story_content', 'continue_story_content']
