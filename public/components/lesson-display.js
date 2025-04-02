import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';
import './display/display-content.js';
import './display/display-empty.js';
import './display/display-error.js';
import './display/display-controls.js';

export class LessonDisplay extends LitElement {
  static get properties() {
    return {
      lesson: { type: Object },
      loading: { type: Boolean, reflect: true },
      error: { type: String },
      showControls: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.lesson = null;
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

      .lesson-display {
        position: relative;
        background: var(--card-bg, white);
        border-radius: 24px;
        padding: 3rem;
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        transition: var(--transition-normal, all 0.3s ease);
        animation: fadeIn 0.5s ease-in-out;
      }

      .lesson-display:hover {
        box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        .lesson-display {
          padding: 2rem;
        }
      }
    `;
  }

  render() {
    if (this.error) {
      return html`
        <div class="lesson-display">
          <display-error .error=${this.error}></display-error>
        </div>
      `;
    }

    if (!this.lesson) {
      return html`
        <div class="lesson-display">
          <display-empty 
            title="No Lesson Generated Yet"
            message="Fill in the form to generate an educational lesson">
          </display-empty>
        </div>
      `;
    }

    return html`
      <div class="lesson-display">
        <display-content .content=${this.lesson.content}></display-content>
        
        ${this.showControls ? html`
          <display-controls 
            .content=${this.lesson.content} 
            .title=${this.lesson.title || 'Lesson'}>
          </display-controls>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-display')) {
  customElements.define('lesson-display', LessonDisplay);
} 