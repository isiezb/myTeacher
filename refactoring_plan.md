# Refactoring Plan for EasyStory Services

## Current Issue
The `services/story_generator.py` file exceeds the 350-line limit (currently 289 lines) and contains too much functionality in a single file.

## Proposed Refactoring

### 1. Create a new file structure in services/

```
services/
├── __init__.py  
├── llm/
│   ├── __init__.py
│   ├── client.py        # OpenRouter API client code
│   └── prompting.py     # Prompt construction logic
├── story/
│   ├── __init__.py
│   ├── generator.py     # Core story generation logic
│   ├── continuation.py  # Story continuation logic
│   └── parser.py        # Response parsing and validation
└── utils/
    ├── __init__.py
    └── validators.py    # Input validation helpers
```

### 2. Specific Refactoring Steps

1. **Create OpenRouter Client (`services/llm/client.py`)**
   - Move API key handling, headers construction
   - Create reusable API client function
   - Handle common error handling for API calls

2. **Extract Prompt Generation (`services/llm/prompting.py`)**
   - Move prompt building functions
   - Extract output format specification

3. **Core Story Generator (`services/story/generator.py`)**
   - Keep main `generate_story_content` function
   - Import and use the client and prompt modules

4. **Story Continuation (`services/story/continuation.py`)**
   - Move continuation-specific code
   - Import shared components from other modules

5. **Response Parser (`services/story/parser.py`)**
   - Extract response parsing logic (JSON parsing, vocabulary/quiz formatting)
   - Implement validation and error handling for LLM responses

### 3. Benefits

- **Improved Maintainability**: Each file has a single responsibility
- **Better Testability**: Easier to write unit tests for smaller components
- **Code Reuse**: Shared components can be used across different services
- **Easier Collaboration**: Different developers can work on different modules
- **Simplified Debugging**: Isolate issues to specific components
- **Future Extensions**: Easier to add new features or swap components

### 4. Implementation Priority

1. Extract OpenRouter client first (most reusable)
2. Create prompt generation module
3. Split story generator and continuation into separate modules
4. Extract response parsing last (complex but contained) 