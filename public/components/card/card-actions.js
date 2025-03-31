import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class CardActions extends LitElement {
  static get properties() {
    return {
      storyId: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .story-actions {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .story-button {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
        background: var(--primary, #5e7ce6);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-heading, 'Inter', sans-serif);
      }

      .story-button:hover {
        background: var(--primary-600, #4a63b9);
        transform: translateY(-1px);
      }

      .story-button.secondary {
        background: transparent;
        color: var(--text-secondary, #6c757d);
      }

      .story-button.secondary:hover {
        background: var(--bg, #f8f9fa);
        color: var(--text, #212529);
      }

      .story-button.danger {
        background: transparent;
        color: var(--error, #f56565);
      }

      .story-button.danger:hover {
        background: rgba(245, 101, 101, 0.1);
      }
    `;
  }

  constructor() {
    super();
    this.storyId = '';
  }

  _handleViewClick() {
    this.dispatchEvent(new CustomEvent('view-story', {
      detail: { storyId: this.storyId },
      bubbles: true,
      composed: true
    }));
  }

  _handleDeleteClick() {
    if (confirm('Are you sure you want to delete this story?')) {
      this.dispatchEvent(new CustomEvent('delete-story', {
        detail: { storyId: this.storyId },
        bubbles: true,
        composed: true
      }));
    }
  }

  render() {
    return html`
      <div class="story-actions">
        <button @click=${this._handleViewClick} class="story-button">
          Read Story
        </button>
        <button @click=${this._handleDeleteClick} class="story-button danger">
          Delete
        </button>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('card-actions')) {
  customElements.define('card-actions', CardActions);
} 