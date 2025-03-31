import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './card/card-header.js';
import './card/card-content.js';
import './card/card-actions.js';

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
    `;
  }

  _handleViewStory(e) {
    // Re-dispatch event with story details
    this.dispatchEvent(new CustomEvent('view-story', {
      detail: { storyId: this.story.id },
      bubbles: true,
      composed: true
    }));
  }

  _handleDeleteStory(e) {
    // Re-dispatch event with story details
    this.dispatchEvent(new CustomEvent('delete-story', {
      detail: { storyId: this.story.id },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.story) return html`<div>No story data</div>`;

    return html`
      <div class="story-card">
        <card-header
          .title=${this.story.title || 'Untitled Story'}
          .subject=${this.story.subject || 'General'}
          .createdAt=${this.story.created_at}
          .academicGrade=${this.story.academic_grade || 'All grades'}
          .wordCount=${this.story.word_count || 0}
        ></card-header>
        
        <card-content
          .content=${this.story.content || ''}
          .maxLength=${120}
        ></card-content>
        
        ${this.showActions ? html`
          <card-actions
            .storyId=${this.story.id}
            @view-story=${this._handleViewStory}
            @delete-story=${this._handleDeleteStory}
          ></card-actions>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-card')) {
  customElements.define('story-card', StoryCard);
} 