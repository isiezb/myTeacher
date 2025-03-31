import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';

// Import subcomponents
import './continuation/difficulty-selector.js';
import './continuation/difficulty-description.js';
import './continuation/vocabulary-display.js';
import './continuation/continuation-form.js';
import './continuation/continuation-result.js';
import './continuation/error-message.js';
import './continuation/focus-selector.js';
import './story/story-quiz.js';

export class StoryContinuation extends LitElement {
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
      width: 100%;
      text-align: center;
    }

    :host > * {
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.originalStory = null;
    this.isSubmitting = false;
    // Reset all content and state
    this._continuationContent = '';
    this._errorMessage = '';
    this._settings = {
      length: '300',
      difficulty: 'same_level',
      focus: 'general'
    };
    this._vocabularyItems = [];
    this._summary = '';
    this._quiz = [];
    console.log('StoryContinuation constructor called - all state reset');
  }

  updated(changedProperties) {
    if (changedProperties.has('originalStory') && this.originalStory) {
      console.log('StoryContinuation: originalStory set:', this.originalStory.id);
      console.log('Content length:', this.originalStory.content?.length || 0);
      
      // Extract vocabulary items from the original story
      if (this.originalStory.vocabulary && Array.isArray(this.originalStory.vocabulary)) {
        this._vocabularyItems = this.originalStory.vocabulary.map(item => {
          // Ensure importance is set (default to 5 if not available)
          if (typeof item.importance === 'undefined') {
            return { ...item, importance: 5 };
          }
          return item;
        });
        console.log('Vocabulary items extracted from original story:', this._vocabularyItems);
      } else {
        // Initialize with empty array if no vocabulary found
        console.log('No vocabulary items found in original story');
        this._vocabularyItems = [];
      }
      
      // Reset any previous continuation content when a new story is set
      this._continuationContent = '';
      this._errorMessage = '';
      this.requestUpdate();
    }
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
    
    // Clear previous continuation content
    this.isSubmitting = true;
    this._continuationContent = '';
    this._errorMessage = '';
    this._summary = '';
    this._quiz = [];
    this.requestUpdate();
    
    // Show loading overlay
    window.showLoading?.('Continuing your educational story...');
    
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
      original_story_content: originalContent,
      generate_summary: true,
      generate_quiz: true,
      focus: this._settings.focus
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
        
        // Extract summary and quiz if available
        if (data.summary) {
          this._summary = data.summary;
          console.log('Continuation summary:', this._summary);
        }
        
        if (data.quiz && Array.isArray(data.quiz)) {
          this._quiz = data.quiz;
          console.log('Continuation quiz:', this._quiz);
        }
        
        // Dispatch event that continuation is ready
        const event = new CustomEvent('story-continued', { 
          detail: { 
            continuation: data.continuation_text,
            difficulty: data.difficulty || options.difficulty,
            wordCount: data.word_count || 0,
            vocabulary: data.vocabulary || [],
            summary: this._summary,
            quiz: this._quiz,
            focus: options.focus
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
          // Adjust the mock content based on the focus
          let mockContent = '';
          const focusTerm = this._settings.focus;
          
          if (focusTerm === 'general') {
            mockContent = "This is a mock continuation of the story. It would normally come from the API but is being generated locally for development purposes.\n\nThe characters continue their adventure with enthusiasm, learning more about their subject along the way.";
          } else {
            // Create a focus-specific mock continuation
            mockContent = `This is a mock continuation of the story focusing on "${focusTerm}".\n\nThe characters dive deeper into understanding ${focusTerm} and its importance. They discuss various aspects of ${focusTerm} and how it relates to their subject.\n\nThrough practical examples and experiments, they gain a better comprehension of ${focusTerm}.`;
          }
          
          this._continuationContent = mockContent;
          this._errorMessage = '';
          
          // Simulated vocabulary items with the focused term having higher importance if selected
          this._vocabularyItems = [
            { 
              term: focusTerm !== 'general' ? focusTerm : "Sample Term 1", 
              definition: focusTerm !== 'general' ? 
                "This term was the focus of your continuation request." : 
                "This is a sample definition for demonstration purposes.", 
              importance: 10 
            },
            { 
              term: "Sample Term 2", 
              definition: "Another sample definition to show how vocabulary works.", 
              importance: 7 
            }
          ];
          
          // Adjust mock summary to reflect the focus
          this._summary = focusTerm !== 'general' ?
            `This is a mock summary of the continuation focusing on "${focusTerm}". The characters explored this concept in depth.` :
            "This is a mock summary of the continuation. It provides a brief overview of what happened in the story continuation.";
          
          // Adjust mock quiz to reflect the focus
          this._quiz = [
            { 
              question: focusTerm !== 'general' ? 
                `What was the main focus of this continuation?` : 
                "What did the characters do in the continuation?", 
              options: focusTerm !== 'general' ? 
                ["Another topic", focusTerm, "Nothing specific", "A different concept"] : 
                ["They went home", "They continued their adventure", "They went to sleep", "They had lunch"],
              correct_answer: focusTerm !== 'general' ? 1 : 1
            },
            {
              question: "What did the characters learn more about?",
              options: ["History", "Math", "Their subject", "Geography"],
              correct_answer: 2
            }
          ];
          
          this.requestUpdate();
        }, 1500);
      }
    } finally {
      this.isSubmitting = false;
      
      // Hide loading overlay
      window.hideLoading?.();
      
      this.requestUpdate();
    }
  }

  render() {
    console.log('StoryContinuation render called', {
      hasErrorMessage: !!this._errorMessage,
      hasContinuationContent: !!this._continuationContent,
      hasOriginalStory: !!this.originalStory,
      storyId: this.originalStory?.id
    });
    
    // If there's an error message, show it
    if (this._errorMessage) {
      return html`<error-message .message=${this._errorMessage}></error-message>`;
    }

    // If we have continuation content, show the result
    if (this._continuationContent) {
      // Get the original story metadata
      const originalTitle = this.originalStory?.title || 'Story Continuation';
      const originalSubject = this.originalStory?.subject || 'General';
      const originalGradeLevel = this.originalStory?.grade_level || 'Not specified';
      const wordCount = this._continuationContent.split(/\s+/).length || 0;
      
      return html`
        <continuation-result 
          .continuationContent=${this._continuationContent}
          .vocabularyItems=${this._vocabularyItems}
          .summary=${this._summary}
          .quiz=${this._quiz}
          .difficulty=${this._settings.difficulty}
          .title=${originalTitle}
          .subject=${originalSubject}
          .gradeLevel=${originalGradeLevel}
          .wordCount=${wordCount}
          .focus=${this._settings.focus}
        ></continuation-result>
      `;
    }

    // Otherwise show the form for continuing the story
    return html`
      <continuation-form
        .settings=${this._settings}
        .isSubmitting=${this.isSubmitting}
        .hasOriginalStory=${!!this.originalStory}
        .vocabularyItems=${this._vocabularyItems}
        @settings-change=${this._handleSettingsChange}
        @continue-requested=${this._handleContinueRequested}
      ></continuation-form>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-continuation')) {
  customElements.define('story-continuation', StoryContinuation);
} 