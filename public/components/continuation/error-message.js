import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ErrorMessage extends LitElement {
  static properties = {
    message: { type: String }
  };

  static styles = css`
    .continuation-error {
      color: var(--error, #f56565);
      padding: 1rem;
      border-radius: 8px;
      background-color: rgba(245, 101, 101, 0.1);
      border: 1px solid var(--error, #f56565);
      margin-top: 1rem;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
    }

    p {
      margin: 0;
    }
  `;

  constructor() {
    super();
    this.message = '';
  }

  render() {
    if (!this.message) {
      return html``;
    }
    
    return html`
      <div class="continuation-error">
        <p>${this.message}</p>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('error-message')) {
  customElements.define('error-message'
} 