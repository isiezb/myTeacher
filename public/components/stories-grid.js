import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './story-card.js';

export class StoriesGrid extends LitElement {
  static get properties() {
    return {
      stories: { type: Array },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  constructor() {
    super();
    this.stories = [];
    this.loading = false;
    this.error = '';
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .stories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        background: var(--bg, #f8f9fa);
        border-radius: 12px;
        margin: 2rem 0;
      }

      .empty-state-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--text-secondary, #6c757d);
      }

      .empty-state-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--text, #212529);
      }

      .empty-state-text {
        font-size: 1rem;
        color: var(--text-secondary, #6c757d);
        margin-bottom: 1.5rem;
      }

      .error-message {
        padding: 1rem;
        background: rgba(245, 101, 101, 0.1);
        border: 1px solid var(--error, #f56565);
        border-radius: 8px;
        color: var(--error-dark, #c53030);
        margin-bottom: 1.5rem;
      }

      .loading-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(94, 124, 230, 0.2);
        border-radius: 50%;
        border-top-color: var(--primary, #5e7ce6);
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .stories-grid {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
      }
    `;
  }

  _handleViewStory(e) {
    // Re-dispatch the event to be handled by the parent
    const { storyId } = e.detail;
    this.dispatchEvent(new CustomEvent('view-story', {
      detail: { storyId },
      bubbles: true,
      composed: true
    }));
  }

  _handleDeleteStory(e) {
    // Re-dispatch the event to be handled by the parent
    const { storyId } = e.detail;
    this.dispatchEvent(new CustomEvent('delete-story', {
      detail: { storyId },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading-indicator">
          <div class="spinner"></div>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-message">
          ${this.error}
        </div>
      `;
    }

    if (!this.stories || this.stories.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3 class="empty-state-title">No Stories Yet</h3>
          <p class="empty-state-text">Generate your first educational story to get started!</p>
        </div>
      `;
    }

    return html`
      <div class="stories-grid">
        ${this.stories.map(story => html`
          <story-card 
            .story=${story}
            @view-story=${this._handleViewStory}
            @delete-story=${this._handleDeleteStory}
          ></story-card>
        `)}
      </div>
    `;
  }
}

customElements.define('stories-grid', StoriesGrid); 