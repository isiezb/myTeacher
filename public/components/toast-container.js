import { LitElement, html, css } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";

// Global toast functions
window.showToast = function(message, type = 'info', duration = 4000) {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration },
    bubbles: true,
    composed: true
  });
  document.dispatchEvent(event);
};

class ToastContainer extends LitElement {
    static get properties() {
        return {
            toasts: { type: Array },
            isVisible: { type: Boolean }
        };
    }

    static get styles() {
        return css`
            :host {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }

            .toast {
                background: white;
                border-radius: 4px;
                padding: 12px 24px;
                min-width: 250px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                pointer-events: auto;
                animation: slideIn 0.3s ease-out;
            }

            .toast.success {
                border-left: 4px solid #4caf50;
            }

            .toast.error {
                border-left: 4px solid #f44336;
            }

            .toast.warning {
                border-left: 4px solid #ff9800;
            }

            .toast.info {
                border-left: 4px solid #2196f3;
            }

            .toast-icon {
                font-size: 20px;
            }

            .toast-message {
                flex-grow: 1;
                font-size: 14px;
                line-height: 1.4;
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

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
    }

    constructor() {
        super();
        this.toasts = [];
        this._handleShowToast = this._handleShowToast.bind(this);
        window.addEventListener("show-toast", this._handleShowToast);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("show-toast", this._handleShowToast);
    }

    _handleShowToast(event) {
        const { type = "info", message, duration = 3000 } = event.detail;
        const toast = { type, message, id: Date.now() };
        
        this.toasts = [...this.toasts, toast];
        this.requestUpdate();

        setTimeout(() => {
            const toastElement = this.shadowRoot.querySelector(`[data-toast-id="${toast.id}"]`);
            if (toastElement) {
                toastElement.style.animation = "slideOut 0.3s ease-out forwards";
                setTimeout(() => {
                    this.toasts = this.toasts.filter(t => t.id !== toast.id);
                    this.requestUpdate();
                }, 300);
            }
        }, duration);
    }

    _getToastIcon(type) {
        switch (type) {
            case "success": return "✓";
            case "error": return "✕";
            case "warning": return "⚠";
            case "info": return "ℹ";
            default: return "ℹ";
        }
    }

    render() {
        return html`
            ${this.toasts.map(toast => html`
                <div class="toast ${toast.type}" data-toast-id="${toast.id}">
                    <div class="toast-icon">${this._getToastIcon(toast.type)}</div>
                    <div class="toast-message">${toast.message}</div>
                </div>
            `)}
        `;
    }
}

// Register the custom element
customElements.define("toast-container", ToastContainer);

// Export the showToast function for use in other modules
export function showToast(message, type = "info", duration = 3000) {
    window.dispatchEvent(new CustomEvent("show-toast", {
        detail: { message, type, duration }
    }));
} 