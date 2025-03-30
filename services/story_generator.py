import httpx
import os
import json
from dotenv import load_dotenv
from models.story import StoryGenerationRequest, StoryGenerationResponse, VocabularyItem, QuizItem
from typing import Tuple, Optional, List, Dict

load_dotenv() # Load environment variables from .env file

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet") # Default model
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

async def generate_story_content(request: StoryGenerationRequest) -> StoryGenerationResponse:
    """
    Generates story content, title, summary, and vocabulary using an LLM.
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable not set.")

    prompt, output_format_description = _build_llm_prompt(request)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost", # Optional, replace with your site URL
        "X-Title": "EasyStory", # Optional, replace with your app name
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": f"You are an expert educational storyteller. Generate content exactly in the JSON format described below:\n{output_format_description}"},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"} # Request JSON output
    }

    async with httpx.AsyncClient(timeout=90.0) as client: # Increased timeout for generation
        try:
            print(f"--- Sending request to OpenRouter (Model: {OPENROUTER_MODEL}) ---")
            # print(f"Prompt: {prompt}") # Uncomment for debugging
            response = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            print("--- Received response from OpenRouter ---")

            result_json_str = response.json()['choices'][0]['message']['content']
            # Attempt to parse the JSON string from the LLM response
            generated_data = json.loads(result_json_str)

            # Basic validation of received structure
            if not all(k in generated_data for k in ["title", "story_content"]):
                 raise ValueError("LLM response missing required keys 'title' or 'story_content'.")

            story_content = generated_data.get("story_content", "")
            actual_word_count = len(story_content.split())

            # Process vocabulary if present
            vocabulary_list = None
            if request.generate_vocabulary and "vocabulary" in generated_data:
                try:
                    # Ensure vocabulary is a list of dicts with 'term' and 'definition'
                    raw_vocab = generated_data["vocabulary"]
                    if isinstance(raw_vocab, list):
                         vocabulary_list = [VocabularyItem(**item) for item in raw_vocab if isinstance(item, dict) and "term" in item and "definition" in item]
                    if not vocabulary_list:
                        print("Warning: Vocabulary requested but format from LLM was invalid or empty.")
                except Exception as e:
                    print(f"Warning: Could not parse vocabulary list: {e}")
                    vocabulary_list = None # Fallback if parsing fails
                    
            # Process quiz if present
            quiz_list = None
            if request.generate_quiz and "quiz" in generated_data:
                try:
                    # Ensure quiz is a list of dicts with 'question', 'options', and 'correct_answer'
                    raw_quiz = generated_data["quiz"]
                    if isinstance(raw_quiz, list):
                        quiz_list = []
                        for item in raw_quiz:
                            if isinstance(item, dict) and "question" in item and "options" in item and "correct_answer" in item:
                                # Make sure correct_answer is an integer (index)
                                if isinstance(item["correct_answer"], int):
                                    quiz_list.append(QuizItem(**item))
                                elif isinstance(item["correct_answer"], str) and item["correct_answer"].isdigit():
                                    item["correct_answer"] = int(item["correct_answer"])
                                    quiz_list.append(QuizItem(**item))
                    if not quiz_list:
                        print("Warning: Quiz requested but format from LLM was invalid or empty.")
                except Exception as e:
                    print(f"Warning: Could not parse quiz list: {e}")
                    quiz_list = None # Fallback if parsing fails


            return StoryGenerationResponse(
                title=generated_data.get("title", "Generated Story"),
                content=story_content,
                academic_grade=request.academic_grade,
                subject=request.subject, # Use the core subject provided
                word_count=actual_word_count,
                language=request.language,
                summary=generated_data.get("summary") if request.generate_summary else None,
                vocabulary=vocabulary_list,
                quiz=quiz_list,
                learning_objectives=generated_data.get("learning_objectives") # Optional field
            )

        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
            raise Exception(f"LLM API request failed with status {e.response.status_code}.") from e
        except httpx.RequestError as e:
            print(f"An error occurred while requesting {e.request.url!r}.")
            raise Exception("Could not connect to the LLM API.") from e
        except json.JSONDecodeError as e:
             print(f"Error decoding JSON response from LLM: {e}")
             print(f"Received text: {result_json_str}")
             raise ValueError("Could not parse the JSON response from the language model.") from e
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            raise


def _build_llm_prompt(request: StoryGenerationRequest) -> Tuple[str, str]:
    """Builds the prompt string and JSON format description for the LLM."""

    subject_display = request.other_subject if request.subject == 'other' and request.other_subject else request.subject

    prompt_lines = [
        f"Generate an educational story in {request.language}.",
        f"Target Audience: Grade {request.academic_grade} students.",
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

    output_schema = {
        "title": "string (Compelling title for the story)",
        "story_content": "string (The full story text, with paragraphs separated by double line breaks '\\n\\n')",
        "learning_objectives": "[string] (Optional: 3-5 bullet points outlining potential educational takeaways)"
    }

    if request.generate_summary:
        prompt_lines.append("- Generate a concise summary (2-3 sentences).")
        output_schema["summary"] = "string (Concise 2-3 sentence summary)"

    if request.generate_vocabulary:
        prompt_lines.append("- Generate a list of 5-7 key vocabulary words relevant to the grade level and subject, each with a simple definition.")
        output_schema["vocabulary"] = '[{"term": "string", "definition": "string"}] (List of 5-7 vocabulary words and definitions)'

    if request.generate_quiz:
        prompt_lines.append("- Generate a quiz with 3-5 multiple-choice questions about the story content. Each question should have 4 options with one correct answer.")
        output_schema["quiz"] = '[{"question": "string", "options": ["string"], "correct_answer": int}] (List of quiz questions, each with an array of 4 options and the index of the correct answer (0-3))'

    prompt_lines.append("\nOutput the entire result as a single JSON object conforming exactly to the specified structure.")

    # Describe the JSON structure for the system prompt
    output_format_description = json.dumps(output_schema, indent=2)

    return "\n".join(prompt_lines), output_format_description 