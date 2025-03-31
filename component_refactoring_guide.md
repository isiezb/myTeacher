# Component Refactoring Guide for EasyStory

This guide provides specific instructions for refactoring the largest components in the EasyStory frontend to comply with our 350-line limit.

## Large Components to Refactor

The following components exceed our 350-line limit and should be refactored:

1. **story-content.js** (864 lines)
2. **story-form.js** (701 lines)
3. **story-continuation.js** (659 lines)

## Refactoring Approach

### General Principles

1. **Component Composition**: Break large components into smaller, focused sub-components
2. **Separation of Concerns**: Separate UI, state management, and business logic
3. **Single Responsibility**: Each component should do one thing well
4. **Reusability**: Create reusable components that can be shared across the application

### Shared Services to Extract

Create these shared service files:

1. `public/js/services/story-service.js` - Story data management (fetch, parse, validate)
2. `public/js/services/form-service.js` - Form handling utilities (validation, submission)
3. `public/js/services/ui-service.js` - UI utilities (modal, animations, state transitions)

## Component-Specific Refactoring Plans

### 1. story-content.js (864 lines)

Split into:

1. `story-content.js` (base component, ~200 lines)
   - Core rendering logic and property definitions
   - Composition of sub-components

2. `story-header.js` (~100 lines)
   - Title, metadata, and actions for the story

3. `story-text.js` (~100 lines)
   - Main story content with styling and interactions

4. `story-vocabulary.js` (~150 lines)
   - Vocabulary display with definitions and interaction

5. `story-quiz.js` (~150 lines)
   - Quiz rendering and interaction logic

6. `story-summary.js` (~100 lines)
   - Summary display with styling and interactions

### 2. story-form.js (701 lines)

Split into:

1. `story-form.js` (container component, ~150 lines)
   - Form structure and submission logic
   - Form state management

2. `form-section.js` (~100 lines)
   - Reusable section component for grouping related inputs

3. `subject-selector.js` (~150 lines)
   - Subject selection with custom fields

4. `grade-selector.js` (~100 lines)
   - Grade selection with appropriate UI

5. `story-options.js` (~150 lines)
   - Options for story generation (word count, language, etc.)

### 3. story-continuation.js (659 lines)

Split into:

1. `story-continuation.js` (container component, ~150 lines)
   - Main continuation logic and state management

2. `continuation-form.js` (~150 lines)
   - Form for configuring story continuation

3. `continuation-results.js` (~150 lines)
   - Display of continuation results

4. `continuation-vocabulary.js` (~150 lines)
   - Display of vocabulary for the continuation

## Implementation Strategy

1. **Create Base Structure**: First, set up the folder structure and create empty files
2. **Extract Sub-Components**: Move related code to appropriate files
3. **Create Service Files**: Extract shared utilities and business logic
4. **Update Dependencies**: Fix imports and references between components
5. **Test Incrementally**: Test each component after refactoring

## Example: Refactoring story-content.js

```javascript
// story-content.js (Base component)
import { LitElement, html, css } from 'lit';
import './story-header.js';
import './story-text.js';
import './story-summary.js';
import './story-vocabulary.js';
import './story-quiz.js';

class StoryContent extends LitElement {
  static properties = {
    story: { type: Object },
    showHeader: { type: Boolean },
    showSummary: { type: Boolean },
    showVocabulary: { type: Boolean },
    showQuiz: { type: Boolean }
  };

  static styles = css`
    /* Base styles only - specific styles moved to sub-components */
    .story-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  `;

  render() {
    if (!this.story) {
      return html`<div class="empty-state">No story to display</div>`;
    }

    return html`
      <div class="story-container">
        ${this.showHeader ? 
          html`<story-header .story=${this.story}></story-header>` : 
          ''
        }
        
        <story-text .content=${this.story.content}></story-text>
        
        ${this.showSummary && this.story.summary ? 
          html`<story-summary .summary=${this.story.summary}></story-summary>` : 
          ''
        }
        
        ${this.showVocabulary && this.story.vocabulary ? 
          html`<story-vocabulary .vocabulary=${this.story.vocabulary}></story-vocabulary>` : 
          ''
        }
        
        ${this.showQuiz && this.story.quiz ? 
          html`<story-quiz .quiz=${this.story.quiz}></story-quiz>` : 
          ''
        }
      </div>
    `;
  }
}

customElements.define('story-content', StoryContent);
``` 