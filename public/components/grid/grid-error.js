import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class GridError extends LitElement {
  static get properties() {
    return {
      message: { type: String },
      onRetry: { type: Function }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .error-message {
        padding: 1rem;
        background: rgba(245, 101, 101, 0.1);
        border: 1px solid var(--error, #f56565);
        border-radius: 8px;
        color: var(--error-dark, #c53030);
        margin-bottom: 1.5rem;
      }

      .refresh-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary, #5e7ce6);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 1rem;
      }
      
      .refresh-button:hover {
        background: var(--primary-dark, #4b63b8);
      }
    `;
  }

  constructor() {
    super();
    this.message = 'An error occurred';
    this.onRetry = () => {};
  }

  render() {
    return html`
      <div class="error-message">
        <p>Error loading stories: ${this.message}</p>
        <button @click=${this.onRetry} class="refresh-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Try Again
        </button>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('grid-error')) {
  customElements.define('grid-error', GridError);
} 