import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class GridEmptyState extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      message: { type: String },
      icon: { type: String },
      onRefresh: { type: Function }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
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
      }
      
      .refresh-button:hover {
        background: var(--primary-dark, #4b63b8);
      }
    `;
  }

  constructor() {
    super();
    this.title = 'No Items Found';
    this.message = 'There are no items to display at this time.';
    this.icon = '📚';
    this.onRefresh = () => {};
  }

  render() {
    return html`
      <div class="empty-state">
        <div class="empty-state-icon">${this.icon}</div>
        <h3 class="empty-state-title">${this.title}</h3>
        <p class="empty-state-text">${this.message}</p>
        <button @click=${this.onRefresh} class="refresh-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('grid-empty-state')) {
  customElements.define('grid-empty-state', GridEmptyState);
} 