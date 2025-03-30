import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class StoryCard extends LitElement {
  static get properties() {
    return {
      story: { type: Object },
      showActions: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.story = null;
    this.showActions = true;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      }

      .story-card {
        background: var(--card-bg, white);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        transition: all 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .story-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
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

      .story-actions {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .story-button {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
        background: var(--primary, #5e7ce6);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-heading, 'Inter', sans-serif);
      }

      .story-button:hover {
        background: var(--primary-600, #4a63b9);
        transform: translateY(-1px);
      }

      .story-button.secondary {
        background: transparent;
        color: var(--text-secondary, #6c757d);
      }

      .story-button.secondary:hover {
        background: var(--bg, #f8f9fa);
        color: var(--text, #212529);
      }

      .story-button.danger {
        background: transparent;
        color: var(--error, #f56565);
      }

      .story-button.danger:hover {
        background: rgba(245, 101, 101, 0.1);
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

  _formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  _getExcerpt(content, maxLength = 120) {
    if (!content) return '';
    
    if (content.length <= maxLength) return content;
    
    return content.substring(0, maxLength).trim() + '...';
  }

  _handleViewClick() {
    this.dispatchEvent(new CustomEvent('view-story', {
      detail: { storyId: this.story.id },
      bubbles: true,
      composed: true
    }));
  }

  _handleDeleteClick() {
    if (confirm('Are you sure you want to delete this story?')) {
      this.dispatchEvent(new CustomEvent('delete-story', {
        detail: { storyId: this.story.id },
        bubbles: true,
        composed: true
      }));
    }
  }

  render() {
    if (!this.story) return html`<div>No story data</div>`;

    return html`
      <div class="story-card">
        <div class="story-header">
          <h3 class="story-title">${this.story.title || 'Untitled Story'}</h3>
          <div class="tag">${this.story.subject || 'General'}</div>
          <div class="story-meta">
            <div class="story-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${this._formatDate(this.story.created_at)}
            </div>
            <div class="story-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20V12M12 12V4M12 12H4M12 12H20"></path>
              </svg>
              ${this.story.academic_grade || 'All grades'}
            </div>
            <div class="story-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              ${this.story.word_count || 0} words
            </div>
          </div>
        </div>
        
        <div class="story-content">
          <p class="story-excerpt">${this._getExcerpt(this.story.content)}</p>
        </div>
        
        ${this.showActions ? html`
          <div class="story-actions">
            <button @click=${this._handleViewClick} class="story-button">
              Read Story
            </button>
            <button @click=${this._handleDeleteClick} class="story-button danger">
              Delete
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('story-card', StoryCard); 