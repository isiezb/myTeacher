import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class RefreshButton extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      onClick: { type: Function }
    };
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
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
        margin-bottom: 1.5rem;
      }
      
      .refresh-button:hover {
        background: var(--primary-dark, #4b63b8);
      }
    `;
  }

  constructor() {
    super();
    this.label = 'Refresh';
    this.onClick = () => {};
  }

  render() {
    return html`
      <button @click=${this.onClick} class="refresh-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        ${this.label}
      </button>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('refresh-button')) {
  customElements.define('refresh-button', RefreshButton);
} 