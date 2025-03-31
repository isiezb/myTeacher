import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';

// Import subcomponents
import './continuation/difficulty-selector.js';
import './continuation/difficulty-description.js';
import './continuation/vocabulary-display.js';
import './continuation/continuation-form.js';
import './continuation/continuation-result.js';
import './continuation/error-message.js';

export class StoryContinuationRefactored extends LitElement {
  static properties = {
    originalStory: { type: Object },
    isSubmitting: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      margin: 2rem auto;
      padding-top: 2rem;
      border-top: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      max-width: 800px;
    }
  `;

  constructor() {
    super();
    this.originalStory = null;
    this.isSubmitting = false;
    this._continuationContent = '';
    this._errorMessage = '';
    this._settings = {
      length: '300',
      difficulty: 'same_level'
    };
    this._vocabularyItems = [];
  }

  _handleSettingsChange(e) {
    this._settings = e.detail.settings;
  }

  async _handleContinueRequested() {
    if (this.isSubmitting) return; 
    
    // Check if we have an original story
    if (!this.originalStory) {
      this._errorMessage = 'No story to continue. Please generate a story first.';
      this.requestUpdate();
      return;
    }
    
    // Double-check that we have an actual story object with content
    if (!this.originalStory.content) {
      this._errorMessage = 'Original story is missing content. Please regenerate the story.';
      console.error('Original story is missing content:', this.originalStory);
      this.requestUpdate();
      return;
    }
    
    this.isSubmitting = true;
    this._continuationContent = '';
    this._errorMessage = '';
    this.requestUpdate();
    
    // Ensure we have a valid story object
    const originalStory = this.originalStory || {};
    
    // Generate a mock ID if one doesn't exist
    const storyId = originalStory.id || `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Make sure we have the content
    const originalContent = originalStory.content || '';
    
    if (!originalContent) {
      console.error('Original story content is empty even after checks');
    }
    
    // Map UI difficulty values to API values
    const difficultyMap = {
      'much_easier': 'much_easier',
      'slightly_easier': 'slightly_easier', 
      'same_level': 'same_level',
      'slightly_harder': 'slightly_harder',
      'much_harder': 'much_harder'
    };
    
    // Prepare options with complete original story content
    const options = {
      length: parseInt(this._settings.length, 10),
      difficulty: difficultyMap[this._settings.difficulty] || 'same_level',
      original_story_content: originalContent
    };
    
    // Log what we're about to do (limiting content length for logging)
    const logOptions = {...options};
    if (logOptions.original_story_content) {
      logOptions.original_story_content = logOptions.original_story_content.substring(0, 100) + '...';
    }
    console.log(`Continuing story ${storyId} with options:`, logOptions);
    console.log(`Original story content length: ${originalContent.length} characters`);
    
    try {
      // Check if API service exists and has the required method
      if (!window.apiService || typeof window.apiService.continueStory !== 'function') {
        throw new Error('API service not available');
      }
      
      // Use the API service to continue the story
      const data = await window.apiService.continueStory(storyId, options);
      
      // Process the continuation response
      if (data && data.continuation_text) {
        this._continuationContent = data.continuation_text;
        
        // Process vocabulary items if available
        if (data.vocabulary && Array.isArray(data.vocabulary)) {
          console.log('New vocabulary items:', data.vocabulary);
          this._vocabularyItems = data.vocabulary;
        } else {
          this._vocabularyItems = [];
        }
        
        // Dispatch event that continuation is ready
        const event = new CustomEvent('story-continued', { 
          detail: { 
            continuation: data.continuation_text,
            difficulty: data.difficulty,
            wordCount: data.word_count,
            vocabulary: data.vocabulary
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      } else {
        throw new Error('Received empty or invalid continuation response');
      }
    } catch (error) {
      console.error('Error continuing story:', error);
      this._errorMessage = `Failed to continue the story: ${error.message || 'Unknown error'}`;
      
      // Use mock data in development if API is unavailable
      if (window.ENV_USE_MOCK_DATA === true) {
        console.log('Using mock continuation data...');
        setTimeout(() => {
          this._continuationContent = "This is a mock continuation of the story. It would normally come from the API but is being generated locally for development purposes.\n\nThe characters continue their adventure with enthusiasm, learning more about their subject along the way.";
          this._errorMessage = '';
          this._vocabularyItems = [
            { term: "Sample Term 1", definition: "This is a sample definition for demonstration purposes." },
            { term: "Sample Term 2", definition: "Another sample definition to show how vocabulary works." }
          ];
          this.requestUpdate();
        }, 1500);
      }
    } finally {
      this.isSubmitting = false;
      this.requestUpdate();
    }
  }

  render() {
    // If there's an error message, show it
    if (this._errorMessage) {
      return html`<error-message .message=${this._errorMessage}></error-message>`;
    }

    // If we have continuation content, show the result
    if (this._continuationContent) {
      return html`
        <continuation-result 
          .continuationContent=${this._continuationContent}
          .vocabularyItems=${this._vocabularyItems}
        ></continuation-result>
      `;
    }

    // Otherwise show the form for continuing the story
    return html`
      <continuation-form
        .settings=${this._settings}
        .isSubmitting=${this.isSubmitting}
        .hasOriginalStory=${!!this.originalStory}
        @settings-change=${this._handleSettingsChange}
        @continue-requested=${this._handleContinueRequested}
      ></continuation-form>
    `;
  }
}

customElements.define('story-continuation-refactored', StoryContinuationRefactored); 