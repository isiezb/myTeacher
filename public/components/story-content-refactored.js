import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './story/story-header.js';
import './story/story-text.js';
import './story/story-summary.js';
import './story/story-vocabulary.js';
import './story/story-quiz.js';

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
  `;

  constructor() {
    super();
    this.story = null;
    this.showHeader = true;
    this.showSummary = true;
    this.showVocabulary = true;
    this.showQuiz = true;
  }

  updated(changedProperties) {
    if (changedProperties.has('story') && this.story) {
      // Expose the story to the global window so it can be accessed by other components
      // This maintains compatibility with the original implementation
      if (window) {
        window.currentStory = this.story;
      }
      
      // Dispatch a custom event to notify parent components
      this.dispatchEvent(new CustomEvent('story-loaded', { 
        detail: { story: this.story },
        bubbles: true, 
        composed: true 
      }));
    }
  }

  _handleContinueStory() {
    // Dispatch event to notify parent components that the user wants to continue the story
    this.dispatchEvent(new CustomEvent('continue-story', { 
      detail: { story: this.story },
      bubbles: true, 
      composed: true 
    }));
  }

  render() {
    if (!this.story) {
      return html`
        <div class="story-content-container">
          <div class="empty-state">No story to display</div>
        </div>
      `;
    }

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
      </div>
    `;
  }
}

customElements.define('story-content', StoryContent); 