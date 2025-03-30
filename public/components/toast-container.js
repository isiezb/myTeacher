import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './toast-notification.js';

export class ToastContainer extends LitElement {
  static get properties() {
    return {
      position: { type: String, reflect: true }
    };
  }

  constructor() {
    super();
    this.position = 'top-right'; // top-right, top-left, bottom-right, bottom-left
    this._listenForToasts();
  }

  _listenForToasts() {
    // Listen for the show-toast event on the document
    document.addEventListener('show-toast', (e) => {
      const { message, type, duration } = e.detail;
      this.showToast(message, type, duration);
    });
  }

  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('toast-notification');
    toast.message = message;
    toast.type = type;
    toast.duration = duration;
    
    this.shadowRoot.querySelector('.container').appendChild(toast);
    
    // Return the toast element in case the caller wants to manipulate it further
    return toast;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        z-index: 9999;
        pointer-events: none;
      }
      
      .container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        max-width: 20rem;
        max-height: 100vh;
        overflow-y: auto;
      }
      
      :host([position="top-right"]) {
        top: 0;
        right: 0;
      }
      
      :host([position="top-left"]) {
        top: 0;
        left: 0;
      }
      
      :host([position="bottom-right"]) {
        bottom: 0;
        right: 0;
      }
      
      :host([position="bottom-left"]) {
        bottom: 0;
        left: 0;
      }
      
      /* Ensure toast notifications can be clicked */
      toast-notification {
        pointer-events: auto;
      }
    `;
  }

  render() {
    return html`
      <div class="container"></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Set the position attribute to reflect it to CSS
    this.setAttribute('position', this.position);
    
    // Register global access
    if (!window.toastContainer) {
      window.toastContainer = this;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    
    // Remove global reference if it's this instance
    if (window.toastContainer === this) {
      delete window.toastContainer;
    }
  }
}

customElements.define('toast-container', ToastContainer);

// Helper function to create and add container if not exists
export function showToast(message, type = 'info', duration = 3000) {
  // Use existing container if available
  if (window.toastContainer) {
    return window.toastContainer.showToast(message, type, duration);
  }
  
  // If we're using the event approach, dispatch the event
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration },
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
  
  // For backwards compatibility, create container if no listeners catch the event
  setTimeout(() => {
    if (!window.toastContainer) {
      const container = document.createElement('toast-container');
      document.body.appendChild(container);
      return container.showToast(message, type, duration);
    }
  }, 0);
} 