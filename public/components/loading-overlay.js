import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Global loading functions
window.showLoading = function(message = 'Loading...') {
  console.log('showLoading called with message:', message);
  const event = new CustomEvent('show-loading', {
    detail: { message },
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
  
  // Direct access fallback
  const overlay = document.querySelector('loading-overlay');
  if (overlay) {
    overlay.visible = true;
    overlay.message = message;
  }
};

window.hideLoading = function() {
  console.log('hideLoading called');
  const event = new CustomEvent('hide-loading', {
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
  
  // Direct access fallback
  const overlay = document.querySelector('loading-overlay');
  if (overlay) {
    overlay.visible = false;
  }
};

export class LoadingOverlay extends LitElement {
  static get properties() {
    return {
      message: { type: String },
      visible: { type: Boolean, reflect: true }
    };
  }

  constructor() {
    super();
    this.message = 'Loading...';
    this.visible = false;
    
    // Bind methods
    this._handleShowLoading = this._handleShowLoading.bind(this);
    this._handleHideLoading = this._handleHideLoading.bind(this);
    
    console.log('LoadingOverlay component initialized');
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('show-loading', this._handleShowLoading);
    document.addEventListener('hide-loading', this._handleHideLoading);
    console.log('LoadingOverlay connected, added event listeners');
    
    // Make this component accessible globally
    if (!window._loadingOverlay) {
      window._loadingOverlay = this;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('show-loading', this._handleShowLoading);
    document.removeEventListener('hide-loading', this._handleHideLoading);
    
    // Remove global reference
    if (window._loadingOverlay === this) {
      window._loadingOverlay = null;
    }
  }

  _handleShowLoading(event) {
    console.log('Loading overlay received show-loading event');
    this.message = event.detail.message || 'Loading...';
    this.visible = true;
    this.requestUpdate();
    
    // Force visibility through DOM
    this.style.display = 'flex';
    this.setAttribute('visible', '');
  }

  _handleHideLoading() {
    console.log('Loading overlay received hide-loading event');
    this.visible = false;
    this.requestUpdate();
    
    // Force visibility through DOM
    this.removeAttribute('visible');
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
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: opacity 0.3s ease;
      }
      
      :host([visible]) {
        display: flex !important;
      }

      .loading-container {
        background-color: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        text-align: center;
        max-width: 80%;
        animation: fadeIn 0.3s ease forwards;
      }

      .spinner {
        display: inline-block;
        width: 50px;
        height: 50px;
        border: 4px solid rgba(94, 124, 230, 0.3);
        border-radius: 50%;
        border-top-color: var(--primary, #5e7ce6);
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      .message {
        font-family: var(--font-body, 'Source Serif Pro', serif);
        font-size: 1.125rem;
        color: #333;
        margin: 0;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .spinner, .loading-container {
          animation: none;
        }
      }
    `;
  }

  render() {
    return html`
      <div class="loading-container">
        <div class="spinner"></div>
        <p class="message">${this.message}</p>
      </div>
    `;
  }
  
  // Public API for direct manipulation
  show(message = 'Loading...') {
    this.message = message;
    this.visible = true;
    this.setAttribute('visible', '');
    this.style.display = 'flex';
    this.requestUpdate();
  }
  
  hide() {
    this.visible = false;
    this.removeAttribute('visible');
    this.requestUpdate();
  }
}


// Guard against duplicate registration
if (!customElements.get('loading-overlay')) {
  customElements.define('loading-overlay', LoadingOverlay);
}

export function showLoading(message = 'Loading...') {
  window.showLoading(message);
}

export function hideLoading() {
  window.hideLoading();
} 