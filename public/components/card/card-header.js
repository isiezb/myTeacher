import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class CardHeader extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      subject: { type: String },
      createdAt: { type: String },
      academicGrade: { type: String },
      wordCount: { type: Number }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .story-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }

      .story-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 700;
        font-size: 1.25rem;
        margin: 0 0 0.5rem;
        color: var(--text, #212529);
      }

      .story-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
      }

      .story-meta-item {
        font-size: 0.8125rem;
        color: var(--text-secondary, #6c757d);
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .story-meta-item svg {
        width: 0.875rem;
        height: 0.875rem;
      }

      .tag {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: var(--primary-50, #eef2ff);
        color: var(--primary, #5e7ce6);
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        font-family: var(--font-heading, 'Inter', sans-serif);
      }
    `;
  }

  constructor() {
    super();
    this.title = 'Untitled Story';
    this.subject = 'General';
    this.createdAt = '';
    this.academicGrade = 'All grades';
    this.wordCount = 0;
  }

  _formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  render() {
    return html`
      <div class="story-header">
        <h3 class="story-title">${this.title}</h3>
        <div class="tag">${this.subject}</div>
        <div class="story-meta">
          <div class="story-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${this._formatDate(this.createdAt)}
          </div>
          <div class="story-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20V12M12 12V4M12 12H4M12 12H20"></path>
            </svg>
            ${this.academicGrade}
          </div>
          <div class="story-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            ${this.wordCount} words
          </div>
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('card-header')) {
  customElements.define('card-header', CardHeader);
} 