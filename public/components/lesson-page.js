import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';
import './lesson-content.js';

export class LessonPage extends LitElement {
  static get properties() {
    return {
      lesson: { type: Object },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .lesson-page {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .title {
        font-size: 2rem;
        font-weight: 600;
        color: var(--text, #212529);
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 1rem;
      }

      .button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
      }

      .primary-button {
        background: var(--primary, #5e7ce6);
        color: white;
      }

      .primary-button:hover {
        background: var(--primary-600, #4a63b9);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      }

      .secondary-button {
        background: var(--bg, #f8f9fa);
        color: var(--text, #212529);
        border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      }

      .secondary-button:hover {
        background: var(--bg-hover, #e9ecef);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      }

      .error-state {
        text-align: center;
        padding: 2rem;
        color: var(--error, #dc3545);
      }

      .loading-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary, #6c757d);
      }

      @media (max-width: 768px) {
        :host {
          padding: 1rem;
        }

        .header {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .actions {
          width: 100%;
          justify-content: center;
        }
      }
    `;
  }

  constructor() {
    super();
    this.lesson = null;
    this.loading = false;
    this.error = null;
  }

  _handleContinueLesson() {
    this.dispatchEvent(new CustomEvent('continue-lesson', {
      detail: { lessonId: this.lesson.id },
      bubbles: true,
      composed: true
    }));
  }

  _handleDeleteLesson() {
    this.dispatchEvent(new CustomEvent('delete-lesson', {
      detail: { lessonId: this.lesson.id },
      bubbles: true,
      composed: true
    }));
  }

  _handleBackToList() {
    this.dispatchEvent(new CustomEvent('back-to-list', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (this.error) {
      return html`
        <div class="error-state">
          ${this.error}
        </div>
      `;
    }

    if (this.loading) {
      return html`
        <div class="loading-state">
          Loading lesson...
        </div>
      `;
    }

    if (!this.lesson) {
      return html`
        <div class="error-state">
          No lesson found
        </div>
      `;
    }

    return html`
      <div class="lesson-page">
        <div class="header">
          <h1 class="title">${this.lesson.title}</h1>
          <div class="actions">
            <button class="button secondary-button" @click=${this._handleBackToList}>
              Back to List
            </button>
            <button class="button primary-button" @click=${this._handleContinueLesson}>
              Continue Lesson
            </button>
            <button class="button secondary-button" @click=${this._handleDeleteLesson}>
              Delete Lesson
            </button>
          </div>
        </div>

        <lesson-content
          .lesson=${this.lesson}
          @continue-lesson=${this._handleContinueLesson}
        ></lesson-content>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-page')) {
  customElements.define('lesson-page', LessonPage);
} 