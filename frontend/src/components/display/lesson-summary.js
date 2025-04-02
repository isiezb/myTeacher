import { LitElement, html, css } from 'lit';

export class LessonSummary extends LitElement {
  static properties = {
    summary: { type: String },
  };

  static styles = css`
    :host {
      display: block;
    }
    p {
      font-style: italic;
      color: #444;
      background-color: #f8f9fa;
      padding: 1rem;
      border-left: 3px solid var(--primary-color, #4a63b9);
      margin: 0; /* Reset margin as parent container handles spacing */
      border-radius: 0 4px 4px 0;
    }
  `;

  constructor() {
    super();
    this.summary = '';
  }

  render() {
    if (!this.summary) {
      return html`<p>No summary provided.</p>`;
    }
    return html`<p>${this.summary}</p>`;
  }
}

customElements.define('lesson-summary', LessonSummary); 