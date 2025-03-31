import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class CardContent extends LitElement {
  static get properties() {
    return {
      content: { type: String },
      maxLength: { type: Number }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .story-content {
        padding: 1.5rem;
        flex: 1;
      }

      .story-excerpt {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--text, #212529);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
      }
    `;
  }

  constructor() {
    super();
    this.content = '';
    this.maxLength = 120;
  }

  _getExcerpt(content, maxLength) {
    if (!content) return '';
    
    if (content.length <= maxLength) return content;
    
    return content.substring(0, maxLength).trim() + '...';
  }

  render() {
    return html`
      <div class="story-content">
        <p class="story-excerpt">${this._getExcerpt(this.content, this.maxLength)}</p>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('card-content')) {
  customElements.define('card-content', CardContent);
} 