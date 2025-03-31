import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class StorySummary extends LitElement {
  static properties = {
    summary: { type: String }
  };

  static styles = css`
    .story-summary {
      background: var(--secondary-50, #f8f9fa);
      border-radius: 8px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid var(--secondary, #6c757d);
    }

    .summary-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: var(--text, #212529);
    }

    .summary-text {
      color: var(--text, #212529);
      line-height: 1.5;
      margin: 0;
      font-family: var(--font, 'Inter', sans-serif);
    }
  `;

  constructor() {
    super();
    this.summary = '';
  }

  render() {
    if (!this.summary) {
      return html``;
    }

    return html`
      <div class="story-summary">
        <h3 class="summary-title">Summary</h3>
        <p class="summary-text">${this.summary}</p>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('story-summary')) {
  customElements.define('story-summary', StorySummary);
}