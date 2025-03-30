import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class LoadingOverlay extends LitElement {
  static get properties() {
    return {
      active: { type: Boolean, reflect: true },
      message: { type: String }
    };
  }

  constructor() {
    super();
    this.active = false;
    this.message = 'Loading...';
    this._setupEventListeners();
  }

  _setupEventListeners() {
    document.addEventListener('show-loading', (e) => {
      this.message = e.detail?.message || 'Loading...';
      this.active = true;
    });

    document.addEventListener('hide-loading', () => {
      this.active = false;
    });
  }

  static get styles() {
    return css`
      :host {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        transition: opacity 0.3s;
        opacity: 0;
      }

      :host([active]) {
        display: flex;
        opacity: 1;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
      }

      .message {
        margin-top: 1rem;
        color: white;
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 1rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
  }

  render() {
    return html`
      <div class="spinner"></div>
      <div class="message">${this.message}</div>
    `;
  }
}

customElements.define('loading-overlay', LoadingOverlay);

// Add global loading functions
window.showLoading = (message = 'Loading...') => {
  const event = new CustomEvent('show-loading', {
    detail: { message },
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
};

window.hideLoading = () => {
  const event = new CustomEvent('hide-loading', {
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
}; 