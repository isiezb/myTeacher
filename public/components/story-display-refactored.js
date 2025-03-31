import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';
import '/components/display/display-content.js';
import '/components/display/display-empty.js';
import '/components/display/display-error.js';
import '/components/display/display-controls.js';

export class StoryDisplayRefactored extends LitElement {
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

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        .story-display {
          padding: 2rem;
        }
      }
    `;
  }

  render() {
    if (this.error) {
      return html`
        <div class="story-display">
          <display-error .error=${this.error}></display-error>
        </div>
      `;
    }

    if (!this.story) {
      return html`
        <div class="story-display">
          <display-empty 
            title="No Story Generated Yet"
            message="Fill in the form to generate an educational story">
          </display-empty>
        </div>
      `;
    }

    return html`
      <div class="story-display">
        <display-content .content=${this.story.content}></display-content>
        
        ${this.showControls ? html`
          <display-controls 
            .content=${this.story.content} 
            .title=${this.story.title || 'Story'}>
          </display-controls>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-display-refactored')) {
  customElements.define('story-display-refactored', StoryDisplayRefactored);
} 