import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './card/card-header.js';
import './card/card-content.js';
import './card/card-actions.js';

export class LessonCard extends LitElement {
  static get properties() {
    return {
      lesson: { type: Object },
      showActions: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.lesson = null;
    this.showActions = true;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      }

      .lesson-card {
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

      .lesson-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
      }
    `;
  }

  _handleViewLesson(e) {
    // Re-dispatch event with lesson details
    this.dispatchEvent(new CustomEvent('view-lesson', {
      detail: { lessonId: this.lesson.id },
      bubbles: true,
      composed: true
    }));
  }

  _handleDeleteLesson(e) {
    // Re-dispatch event with lesson details
    this.dispatchEvent(new CustomEvent('delete-lesson', {
      detail: { lessonId: this.lesson.id },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.lesson) return html`<div>No lesson data</div>`;

    return html`
      <div class="lesson-card">
        <card-header
          .title=${this.lesson.title || 'Untitled Lesson'}
          .subject=${this.lesson.subject || 'General'}
          .createdAt=${this.lesson.created_at}
          .academicGrade=${this.lesson.academic_grade || 'All grades'}
          .wordCount=${this.lesson.word_count || 0}
        ></card-header>
        
        <card-content
          .content=${this.lesson.content || ''}
          .maxLength=${120}
        ></card-content>
        
        ${this.showActions ? html`
          <card-actions
            .lessonId=${this.lesson.id}
            @view-lesson=${this._handleViewLesson}
            @delete-lesson=${this._handleDeleteLesson}
          ></card-actions>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-card')) {
  customElements.define('lesson-card', LessonCard);
} 