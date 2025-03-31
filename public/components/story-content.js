import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './story/story-header.js';
import './story/story-text.js';
import './story/story-summary.js';
import './story/story-vocabulary.js';
import './story/story-quiz.js';
import './story/story-utilities.js';

export class StoryContent extends LitElement {
  static properties = {
    story: { type: Object },
    showHeader: { type: Boolean },
    showSummary: { type: Boolean },
    showVocabulary: { type: Boolean },
    showQuiz: { type: Boolean }
  };

  static styles = css`
    .story-content-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-secondary, #6c757d);
      font-style: italic;
    }
    
    .continue-button {
      display: block;
      margin: 2rem auto 1rem auto;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background: var(--primary, #5e7ce6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .continue-button:hover {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }
  `;

  constructor() {
    super();
    this.story = null;
    this.showHeader = true;
    this.showSummary = true;
    this.showVocabulary = true;
    this.showQuiz = true;
    
    console.log('StoryContent component initialized');
  }
  
  connectedCallback() {
    super.connectedCallback();
    console.log('StoryContent connected to DOM');
    
    // Check if we already have a story in the window
    if (window.currentStory && !this.story) {
      console.log('Found window.currentStory, using it');
      this.story = window.currentStory;
      this.requestUpdate();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('story') && this.story) {
      // Expose the story to the global window so it can be accessed by other components
      // This maintains compatibility with the original implementation
      if (window) {
        window.currentStory = this.story;
      }
      
      // Log story details to help debug summary issues
      console.log('StoryContent updated with story:', {
        id: this.story.id,
        contentLength: this.story.content?.length || 0,
        hasSummary: !!this.story.summary,
        summaryLength: this.story.summary?.length || 0,
        summaryPreview: this.story.summary ? this.story.summary.substring(0, 50) + '...' : 'none',
        hasVocabulary: !!this.story.vocabulary && Array.isArray(this.story.vocabulary),
        vocabularyCount: (this.story.vocabulary || []).length,
        hasQuiz: !!this.story.quiz && Array.isArray(this.story.quiz),
        quizCount: (this.story.quiz || []).length,
        showSummary: this.showSummary
      });
      
      // Dispatch custom events to notify parent components
      this.dispatchEvent(new CustomEvent('story-loaded', { 
        detail: { story: this.story },
        bubbles: true, 
        composed: true 
      }));
      
      this.dispatchEvent(new CustomEvent('story-updated', { 
        detail: { story: this.story },
        bubbles: true, 
        composed: true 
      }));
      
      // Make sure parent container is visible
      const storyResult = this.closest('#story-result');
      if (storyResult && storyResult.classList.contains('hidden')) {
        console.log('Removing hidden class from story-result from within component');
        storyResult.classList.remove('hidden');
      }
    }
  }

  _handleContinueStory(e) {
    console.log('Continue Story button clicked in story-content component');
    
    // Make sure we have the current story data
    if (!this.story) {
      console.error('No story data available in the component');
      return;
    }
    
    console.log('Dispatching continue-story event with story:', this.story);
    
    // Dispatch event to notify parent components that the user wants to continue the story
    this.dispatchEvent(new CustomEvent('continue-story', { 
      detail: { story: this.story },
      bubbles: true, 
      composed: true 
    }));
  }

  render() {
    console.log('StoryContent render called, has story:', !!this.story);
    
    if (!this.story) {
      return html`
        <div class="story-content-container">
          <div class="empty-state">No story to display</div>
        </div>
      `;
    }

    // Only show the continue button if there's no quiz or showQuiz is false
    const shouldShowContinueButton = !this.showQuiz || !this.story.quiz;
    
    console.log('Rendering story with content length:', this.story.content?.length || 0);

    return html`
      <div class="story-content-container">
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
        
        <story-utilities .story=${this.story}></story-utilities>
        
        ${shouldShowContinueButton ? 
          html`<button class="continue-button" @click=${this._handleContinueStory}>
            Continue Story
          </button>` : 
          ''
        }
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-content')) {
  customElements.define('story-content', StoryContent);
} 