import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ErrorBoundary extends LitElement {
  static get properties() {
    return {
      error: { type: Object },
      errorInfo: { type: Object },
      hasError: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .error-container {
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        background-color: var(--error-bg, #fff3f3);
        border: 1px solid var(--error-border, #dc3545);
        color: var(--error-text, #dc3545);
      }

      .error-header {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .error-message {
        margin-bottom: 1rem;
        font-family: monospace;
        white-space: pre-wrap;
      }

      .error-stack {
        font-family: monospace;
        font-size: 0.875rem;
        white-space: pre-wrap;
        background: rgba(0, 0, 0, 0.05);
        padding: 0.5rem;
        border-radius: 4px;
        margin-top: 0.5rem;
      }

      .retry-button {
        background: var(--primary, #5e7ce6);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }

      .retry-button:hover {
        background: var(--primary-dark, #4a63b9);
      }

      .retry-button:focus {
        outline: 2px solid var(--primary, #5e7ce6);
        outline-offset: 2px;
      }

      @media (forced-colors: active) {
        .error-container {
          border: 2px solid CanvasText;
        }
        .retry-button {
          border: 2px solid ButtonText;
        }
      }
    `;
  }

  constructor() {
    super();
    this.error = null;
    this.errorInfo = null;
    this.hasError = false;
    this._errorLog = [];

    // Initialize error tracking
    this._initErrorTracking();
  }

  _initErrorTracking() {
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this._handleError(event.error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this._handleError(event.reason);
    });
  }

  _handleError(error) {
    // Add error to log
    this._errorLog.push({
      timestamp: new Date(),
      error: error.message || 'Unknown error',
      stack: error.stack
    });

    // Limit log size
    if (this._errorLog.length > window.ENV_ERROR_REPORTING?.MAX_ERRORS || 10) {
      this._errorLog.shift();
    }

    // Report error if enabled
    if (window.ENV_ERROR_REPORTING?.ENABLED) {
      this._reportError(error);
    }

    this.error = error;
    this.hasError = true;
    this.requestUpdate();
  }

  async _reportError(error) {
    try {
      // Log to console in debug mode
      if (window.ENV_DEBUG) {
        console.error('Error caught by boundary:', error);
      }

      // Here you would typically send the error to your error reporting service
      // For now, we'll just log it
      const errorReport = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.warn('Error report:', errorReport);
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }

  retry() {
    this.error = null;
    this.errorInfo = null;
    this.hasError = false;
    this.requestUpdate();

    // Dispatch event for parent components
    this.dispatchEvent(new CustomEvent('error-boundary-reset', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.hasError) {
      return html`<slot></slot>`;
    }

    return html`
      <div class="error-container" role="alert" aria-live="assertive">
        <div class="error-header">
          Something went wrong
        </div>
        <div class="error-message">
          ${this.error?.message || 'An unexpected error occurred'}
        </div>
        ${this.error?.stack ? html`
          <details>
            <summary>Error Details</summary>
            <div class="error-stack">${this.error.stack}</div>
          </details>
        ` : ''}
        <button 
          class="retry-button" 
          @click=${this.retry}
          aria-label="Retry the operation"
        >
          Try Again
        </button>
      </div>
    `;
  }
}

// Register the component
if (!customElements.get('error-boundary')) {
  customElements.define('error-boundary', ErrorBoundary);
} 