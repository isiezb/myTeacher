from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal, Union
import uuid
from datetime import datetime

# --- Shared Sub-Models ---

class VocabularyItem(BaseModel):
    """Represents a single vocabulary term and its definition."""
    term: str = Field(..., description="The vocabulary word or phrase.")
    definition: str = Field(..., description="A concise definition suitable for the target audience.")

class QuizOption(BaseModel):
    """Represents a single option in a multiple-choice question."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the option.")
    text: str = Field(..., description="The text content of the option.")

class QuizItem(BaseModel):
    """Represents a single multiple-choice quiz question."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the quiz question.")
    question: str = Field(..., description="The text of the quiz question.")
    options: List[QuizOption] = Field(..., min_length=2, max_length=5, description="List of possible answers (options).")
    correct_option_id: str = Field(..., description="The ID of the correct option within the options list.")

    @field_validator('options')
    def check_correct_option_id_exists(cls, options: List[QuizOption], values):
        """Validate that the correct_option_id corresponds to an actual option ID."""
        data = values.data # Access other fields provided to the model
        correct_id = data.get('correct_option_id')
        if correct_id:
            option_ids = {option.id for option in options}
            if correct_id not in option_ids:
                raise ValueError(f"correct_option_id '{correct_id}' does not match any provided option ID.")
        return options

# --- Lesson Generation ---

class LessonGenerationRequest(BaseModel):
    """Defines the parameters for generating a new lesson."""
    academic_grade: str = Field(..., description="Target academic grade level (e.g., 'K', '5', '12', 'University').")
    subject: str = Field(..., description="Main subject area (e.g., 'Biology', 'History', 'Mathematics').")
    topic: Optional[str] = Field(None, description="Specific topic focus within the subject (e.g., 'Mitosis', 'World War II', 'Algebra').")
    teacher_style: Literal["Encouraging", "Structured", "Creative", "Direct"] = Field(
        default="Encouraging",
        description="Desired teaching style/persona for the lesson content."
    )
    word_count: int = Field(default=300, gt=50, le=2000, description="Approximate target word count for the lesson content.")
    language: str = Field(default="English", description="Target language for the lesson.")
    include_summary: bool = Field(default=True, description="Flag to include a concise summary.")
    include_vocabulary: bool = Field(default=True, description="Flag to include a list of key vocabulary terms.")
    include_quiz: bool = Field(default=True, description="Flag to include a multiple-choice comprehension quiz.")
    user_prompt_addition: Optional[str] = Field(None, description="Optional additional instructions or context from the user.")

class LessonGenerationResponse(BaseModel):
    """Defines the structure of a generated lesson."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the generated lesson.")
    title: str = Field(..., description="Generated title for the lesson.")
    lesson_content: str = Field(..., description="The main generated lesson text, likely using Markdown for formatting.")
    academic_grade: str = Field(..., description="The academic grade level used for generation.")
    subject: str = Field(..., description="The subject used for generation.")
    topic: Optional[str] = Field(None, description="The specific topic used, if provided.")
    teacher_style: str = Field(..., description="The teaching style used for generation.")
    word_count: int = Field(..., description="Approximate actual word count of the generated content.")
    language: str = Field(..., description="Language of the generated lesson.")
    summary: Optional[str] = Field(None, description="Generated lesson summary, if requested.")
    vocabulary: Optional[List[VocabularyItem]] = Field(None, description="Generated vocabulary list, if requested.")
    quiz: Optional[List[QuizItem]] = Field(None, description="Generated comprehension quiz, if requested.")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the lesson was generated.")
    # We might add fields later for user ID, saved status, etc.

# --- Lesson Continuation ---

class LessonContinuationRequest(BaseModel):
    """Request model for continuing an existing lesson."""
    previous_lesson: LessonGenerationResponse = Field(
        ...,
        description="The complete data structure of the lesson to be continued."
    )
    continuation_prompt: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="User's instructions on how to continue or modify the lesson."
    )

# We will reuse LessonGenerationResponse for the output of a continuation,
# as the AI is expected to regenerate the *entire* lesson structure based on the continuation request.
