import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class StoryItem extends LitElement {
  static get properties() {
    return {
      story: { type: Object },
      onClick: { type: Function }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      
      .story-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }
      
      .story-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        border-color: var(--primary, #5e7ce6);
      }
      
      .story-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: var(--text, #212529);
      }
      
      .story-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary, #6c757d);
      }
      
      .story-excerpt {
        font-size: 0.95rem;
        color: var(--text, #212529);
        margin-top: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
  }

  constructor() {
    super();
    this.story = {};
    this.onClick = () => {};
  }

  _formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  render() {
    if (!this.story) return html``;
    
    return html`
      <div class="story-card" @click=${() => this.onClick(this.story)}>
        <h3 class="story-title">${this.story.title}</h3>
        <div class="story-meta">
          <span>${this.story.subject || 'N/A'}</span>
          <span>•</span>
          <span>Grade ${this.story.academic_grade || 'N/A'}</span>
          <span>•</span>
          <span>${this.story.word_count || 0} words</span>
          <span>•</span>
          <span>${this._formatDate(this.story.created_at)}</span>
        </div>
        <div class="story-excerpt">
          ${this.story.content ? `${this.story.content.substring(0, 150)}...` : 'No content available'}
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-item')) {
  customElements.define('story-item', StoryItem);
} 