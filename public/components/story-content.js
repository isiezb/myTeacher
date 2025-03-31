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
    
    .button-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }
    
    .restart-button {
      display: block;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text, #212529);
      background: var(--bg, #f8f9fa);
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .restart-button:hover {
      background: var(--bg-hover, #e9ecef);
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
  }

  firstUpdated() {
    // Initial scrolling when component is first rendered
    this._scrollToStoryContent();
  }

  _scrollToStoryContent() {
    // If there's a story, scroll to its first paragraph
    if (this.story) {
      setTimeout(() => {
        console.log('Attempting to scroll to story content in component');
        const storyText = this.shadowRoot.querySelector('story-text');
        
        if (storyText && storyText.shadowRoot) {
          const firstParagraph = storyText.shadowRoot.querySelector('.story-text p');
          if (firstParagraph) {
            // Calculate position with header clearance
            const headerHeight = 80; // Adjust based on your header height
            
            // Get the position of the element relative to the top of the document
            const elementPosition = firstParagraph.getBoundingClientRect().top + window.pageYOffset;
            
            // Position the element exactly at the top of the viewport, with just header clearance
            const offsetPosition = elementPosition - headerHeight;
            
            console.log('Scrolling to position:', offsetPosition);
            
            // Scroll to beginning of story content
            window.scrollTo({
              top: offsetPosition,
              behavior: 'auto'  // Use 'auto' instead of 'smooth' for more reliability
            });
            
            // Highlight the first paragraph briefly
            firstParagraph.classList.add('highlight-new-content');
            setTimeout(() => {
              firstParagraph.classList.remove('highlight-new-content');
            }, 2000);
          } else {
            console.warn('No paragraph found in story-text');
          }
        } else {
          console.warn('No story-text component found in story-content');
        }
      }, 50); // Short delay to ensure render is complete
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('story') && this.story) {
      console.log('Story content updated, story:', this.story.id);
      
      // Expose the story to the global window so it can be accessed by other components
      if (window) {
        window.currentStory = this.story;
      }
      
      // Dispatch a custom event to notify parent components
      this.dispatchEvent(new CustomEvent('story-loaded', { 
        detail: { story: this.story },
        bubbles: true, 
        composed: true 
      }));
      
      // Scroll to the content when story is updated
      this._scrollToStoryContent();
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

  _handleRestartStory(e) {
    console.log('Restart Story button clicked in story-content component');
    
    // Make sure we have the current story data
    if (!this.story) {
      console.error('No story data available in the component');
      return;
    }
    
    console.log('Dispatching restart-story event with story:', this.story);
    
    // Dispatch event to notify parent components that the user wants to restart the story
    this.dispatchEvent(new CustomEvent('restart-story', { 
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

    // Only show the continue button if there's no quiz or showQuiz is false
    const shouldShowContinueButton = !this.showQuiz || !this.story.quiz;

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
        
        <div class="button-container">
          ${shouldShowContinueButton ? 
            html`<button class="continue-button" @click=${this._handleContinueStory}>
              Continue Story
            </button>` : 
            ''
          }
          
          <button class="restart-button" @click=${this._handleRestartStory}>
            Create New Story
          </button>
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-content')) {
  customElements.define('story-content', StoryContent);
} 