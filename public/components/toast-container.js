import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Global toast functions
window.showToast = function(message, type = 'info', duration = 4000) {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration },
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
};

export class ToastContainer extends LitElement {
  static get properties() {
    return {
      toasts: { type: Array },
      position: { type: String }
    };
  }

  constructor() {
    super();
    this.toasts = [];
    this.position = 'top-right';
    
    // Bind methods
    this._handleShowToast = this._handleShowToast.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('show-toast', this._handleShowToast);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('show-toast', this._handleShowToast);
  }

  _handleShowToast(event) {
    const { message, type, duration } = event.detail;
    const id = Date.now();
    
    // Add toast to list
    this.toasts = [...this.toasts, { id, message, type, duration }];
    
    // Set timeout to remove toast
    setTimeout(() => {
      this.toasts = this.toasts.filter(toast => toast.id !== id);
    }, duration);
  }

  _getToastIcon(type) {
    switch (type) {
      case 'success':
        return html`<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;
      case 'error':
        return html`<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
      case 'warning':
        return html`<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
      case 'info':
      default:
        return html`<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        z-index: 9999;
      }

      :host([position="top-right"]) {
        top: 16px;
        right: 16px;
      }

      :host([position="top-left"]) {
        top: 16px;
        left: 16px;
      }

      :host([position="bottom-right"]) {
        bottom: 16px;
        right: 16px;
      }

      :host([position="bottom-left"]) {
        bottom: 16px;
        left: 16px;
      }

      .toast-wrapper {
        width: 320px;
        max-width: calc(100vw - 32px);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .toast {
        background: var(--toast-background, white);
        color: var(--toast-color, #333);
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        animation: slideIn 0.3s ease forwards;
        position: relative;
        border-left: 4px solid var(--toast-accent, #ccc);
      }

      .toast.info {
        --toast-accent: var(--primary, #5e7ce6);
      }

      .toast.success {
        --toast-accent: var(--success, #2ecc71);
      }

      .toast.warning {
        --toast-accent: var(--warning, #f39c12);
      }

      .toast.error {
        --toast-accent: var(--error, #e74c3c);
      }

      .toast-icon {
        margin-right: 12px;
        color: var(--toast-accent);
        flex-shrink: 0;
      }

      .toast-message {
        flex-grow: 1;
        font-size: 14px;
        font-family: var(--font-body, 'Source Serif Pro', serif);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: none;
        }
      }
    `;
  }

  render() {
    return html`
      <div class="toast-wrapper">
        ${this.toasts.map(toast => html`
          <div class="toast ${toast.type}">
            <div class="toast-icon">${this._getToastIcon(toast.type)}</div>
            <div class="toast-message">${toast.message}</div>
          </div>
        `)}
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('toast-container')) {
  customElements.define('toast-container'
}

export function showToast(message, type = 'info', duration = 4000) {
  window.showToast(message, type, duration);
} 