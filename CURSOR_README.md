# Cursor Configuration for EasyStory

This document describes the Cursor configuration and development tools set up for the EasyStory application.

## Configuration Overview

We've established a comprehensive set of rules in `.cursor.json` to maintain code quality and organization:

- **Line Limits**: Maximum 350 lines per file, with specific limits for different directories
- **Code Style**: Consistent formatting rules (tab size, quotes, etc.)
- **Refactoring Triggers**: Automatic detection of files/functions that need refactoring
- **Component Structure**: Templates and patterns for creating new components

## Key Rules

1. **Maximum Lines per File**: 
   - General: 350 lines
   - Models: 200 lines
   - Routers: 200 lines
   - Services: 350 lines
   - Components: 350 lines

2. **Code Style**:
   - Tab size: 2 spaces
   - Single quotes for strings
   - Line width: 100 characters

3. **Component Structure**:
   - Each component in its own file
   - Follow naming conventions (kebab-case for tags, PascalCase for classes)
   - Use Lit Element for web components

## Utility Scripts

### 1. Line Counter Tool

The `line_counter.py` script helps identify files that exceed our line limits.

```bash
# Basic usage
./line_counter.py

# Scan a specific directory
./line_counter.py -d public/components

# Filter by file pattern
./line_counter.py -p "\.js$"

# Sort by different criteria
./line_counter.py -s lines  # Sort by line count
./line_counter.py -s path   # Sort by path
./line_counter.py -s percent  # Sort by percentage over limit (default)
```

### 2. Component Generator

The `create_component.py` script generates new component files with proper boilerplate.

```bash
# Create a new component
./create_component.py my-new-component

# Create in a different directory
./create_component.py my-component -d public/components/forms

# Force overwrite existing file
./create_component.py my-component -f
```

## Refactoring Guides

We've created detailed refactoring guides:

1. **`refactoring_plan.md`**: Plan for splitting the `services/story_generator.py` file
2. **`component_refactoring_guide.md`**: Detailed steps for refactoring large components

### Key Components to Refactor

The following components exceed our 350-line limit and should be refactored:

1. `story-content.js` (864 lines)
2. `story-form.js` (701 lines)
3. `story-continuation.js` (659 lines)

## Best Practices

1. **Component Composition**: Break large components into smaller, focused sub-components
2. **Separation of Concerns**: Separate UI, state management, and business logic
3. **Single Responsibility**: Each component should do one thing well
4. **Reusability**: Create reusable components that can be shared across the application

## Getting Started

1. Review the `.cursor.json` configuration
2. Run `./line_counter.py` to identify files exceeding limits
3. Follow the refactoring guides to split large files
4. Use `./create_component.py` to create new components 