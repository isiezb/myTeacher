import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class LessonText extends LitElement {
  static properties = {
    content: { type: String }
  };

  static styles = css`
    .lesson-text {
      line-height: 1.8;
      color: var(--text, #212529);
      margin-bottom: 1.5rem;
      font-family: var(--font-text, 'Source Serif Pro', serif);
    }

    .lesson-text p {
      margin-bottom: 1.25rem;
    }

    .empty-state {
      background: var(--secondary-50, #f8f9fa);
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      color: var(--text-secondary, #6c757d);
      font-style: italic;
    }
  `;

  constructor() {
    super();
    this.content = '';
  }

  formatParagraphs(content) {
    if (!content) return '';
    return content.split('\n\n').map(paragraph => 
      html`<p>${paragraph}</p>`
    );
  }

  render() {
    if (!this.content) {
      return html`
        <div class="empty-state">
          No lesson content available.
        </div>
      `;
    }

    return html`
      <div class="lesson-text">
        ${this.formatParagraphs(this.content)}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-text')) {
  customElements.define('lesson-text', LessonText);
} 