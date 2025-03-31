import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class GridLoading extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
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
    `;
  }

  render() {
    return html`
      <div class="loading-indicator">
        <div class="spinner"></div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('grid-loading')) {
  customElements.define('grid-loading', GridLoading);
} 