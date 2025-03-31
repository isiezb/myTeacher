import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class FormSettingsCard extends LitElement {
  static properties = {
    title: { type: String },
    disabled: { type: Boolean }
  };

  static styles = css`
    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      margin-bottom: 32px;
      overflow: visible;
      position: relative;
      border: 1px solid #e9ecef;
    }

    .card-title {
      background: var(--primary-50, #eef2ff);
      color: var(--primary, #5e7ce6);
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      padding: 16px 24px;
      margin: 0;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .card-content {
      padding: 24px;
    }

    @media (max-width: 768px) {
      .form-card {
        margin-bottom: 24px;
        border-radius: 12px;
      }
      
      .card-title {
        font-size: 1.1rem;
        padding: 12px 16px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }
      
      .card-content {
        padding: 16px;
      }
    }
  `;

  constructor() {
    super();
    this.title = '';
    this.disabled = false;
  }

  render() {
    return html`
      <div class="form-card">
        <h3 class="card-title">${this.title}</h3>
        <div class="card-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('form-settings-card', FormSettingsCard); 