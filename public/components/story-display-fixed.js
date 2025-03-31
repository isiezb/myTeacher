// Import dependencies
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

try {
  console.log('⚙️ Loading story-display-fixed.js...');
  
  console.log('✅ Dependencies loaded successfully');
  
  // Define the StoryDisplay class
  class StoryDisplayFixed extends LitElement {
    static get properties() {
      return {
        story: { type: Object },
        loading: { type: Boolean, reflect: true },
        error: { type: String },
        showControls: { type: Boolean }
      };
    }

    constructor() {
      super();
      this.story = null;
      this.loading = false;
      this.error = null;
      this.showControls = true;
      this._isCopied = false;
      
      console.log('✅ StoryDisplayFixed constructor executed');
    }

    static get styles() {
      return css`
        :host {
          display: block;
          font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
        }

        .story-display {
          position: relative;
          background: var(--card-bg, white);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
          border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
          transition: var(--transition-normal, all 0.3s ease);
          animation: fadeIn 0.5s ease-in-out;
        }

        .story-display:hover {
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
        }

        .story-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--text, #212529);
        }

        .story-content p {
          margin-bottom: 1.5rem;
        }

        .error-container {
          padding: 1.5rem;
          background: rgba(245, 101, 101, 0.1);
          border: 1px solid var(--error, #f56565);
          border-radius: 8px;
          color: var(--error-dark, #c53030);
        }

        .error-container h3 {
          margin-top: 0;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
        }

        .empty-state svg {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          color: var(--text-secondary, #6c757d);
        }

        .empty-state h3 {
          font-family: var(--font-heading, 'Inter', sans-serif);
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary, #6c757d);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
    }

    _sanitizeText(text) {
      // Basic sanitization function that preserves paragraphs
      return text ? text.split('\n\n').map(p => p.trim()).filter(Boolean) : [];
    }

    render() {
      console.log('✅ StoryDisplayFixed render called', { 
        hasStory: !!this.story, 
        hasError: !!this.error 
      });
      
      if (this.error) {
        return html`
          <div class="story-display">
            <div class="error-container">
              <h3>Error</h3>
              <p>${this.error}</p>
            </div>
          </div>
        `;
      }

      if (!this.story) {
        return html`
          <div class="story-display">
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3>No Story Generated Yet</h3>
              <p>Fill in the form to generate an educational story</p>
            </div>
          </div>
        `;
      }

      const paragraphs = this._sanitizeText(this.story.content);

      return html`
        <div class="story-display">
          <div class="story-content">
            ${paragraphs.map(p => html`<p>${p}</p>`)}
          </div>
        </div>
      `;
    }
  }
  
  console.log('⚙️ Attempting to register StoryDisplayFixed component...');
  
  // Register the component
  if (!customElements.get('story-display')) {
    customElements.define('story-display', StoryDisplayFixed);
    console.log('✅ StoryDisplayFixed registered as story-display successfully');
    
    // Make the class available globally for debugging
    window.StoryDisplayFixed = StoryDisplayFixed;
  } else {
    console.warn('⚠️ story-display already registered, skipping registration');
  }
  
} catch (error) {
  console.error('❌ Error in story-display-fixed.js:', error);
} 