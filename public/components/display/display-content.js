import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class DisplayContent extends LitElement {
  static get properties() {
    return {
      content: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .story-content {
        font-size: 1.125rem;
        line-height: 1.8;
        color: var(--text, #212529);
      }

      .story-content p {
        margin-bottom: 1.5rem;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  constructor() {
    super();
    this.content = '';
  }

  _sanitizeText(text) {
    // Basic sanitization function that preserves paragraphs
    return text ? text.split('\n\n').map(p => p.trim()).filter(Boolean) : [];
  }

  render() {
    const paragraphs = this._sanitizeText(this.content);
    
    return html`
      <div class="story-content">
        ${paragraphs.map(p => html`<p>${p}</p>`)}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('display-content')) {
  customElements.define('display-content', DisplayContent);
} 