import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class SubmitButton extends LitElement {
  static properties = {
    isLoading: { type: Boolean },
    disabled: { type: Boolean },
    label: { type: String }
  };

  static styles = css`
    .form-actions {
      text-align: center;
    }

    button[type="submit"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 2.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
      background: var(--primary, #5e7ce6);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: var(--transition-normal, all 0.3s ease);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      font-family: var(--font-heading, 'Inter', sans-serif);
      position: relative;
    }

    button[type="submit"]:hover {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
    }

    button[type="submit"]:disabled {
      background: var(--gray-500, #adb5bd);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .spinner {
      display: none;
      width: 1.25rem;
      height: 1.25rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }

    button[type="submit"]:disabled .spinner {
      display: block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.isLoading = false;
    this.disabled = false;
    this.label = 'Submit';
  }

  render() {
    return html`
      <div class="form-actions">
        <button type="submit" ?disabled=${this.isLoading || this.disabled}>
          <div class="spinner"></div>
          ${this.label}
        </button>
      </div>
    `;
  }
}

customElements.define('submit-button', SubmitButton); 