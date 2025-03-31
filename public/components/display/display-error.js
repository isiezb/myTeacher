import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class DisplayError extends LitElement {
  static get properties() {
    return {
      error: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .error-container {
        padding: 1.5rem;
        background: rgba(245, 101, 101, 0.1);
        border: 1px solid var(--error, #f56565);
        border-radius: 8px;
        color: var(--error-dark, #c53030);
        margin-bottom: 1.5rem;
        animation: fadeIn 0.4s ease-in-out;
      }

      h3 {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 1.25rem;
        margin: 0 0 0.5rem 0;
        color: var(--error-dark, #c53030);
      }

      p {
        font-size: 1rem;
        margin: 0;
        line-height: 1.6;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  constructor() {
    super();
    this.error = 'An error occurred';
  }

  render() {
    return html`
      <div class="error-container">
        <h3>Error</h3>
        <p>${this.error}</p>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('display-error')) {
  customElements.define('display-error', DisplayError);
} 