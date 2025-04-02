import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class LessonHeader extends LitElement {
  static properties = {
    lesson: { type: Object }
  };

  static styles = css`
    .lesson-header {
      margin-bottom: 1.5rem;
    }

    .lesson-title {
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 2rem;
      color: var(--text, #212529);
      margin: 0 0 1rem 0;
    }

    .lesson-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      color: var(--text-secondary, #6c757d);
      font-size: 0.875rem;
    }

    .lesson-meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .section-title {
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary, #5e7ce6);
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 60px;
      height: 3px;
      background-color: var(--primary, #5e7ce6);
      border-radius: 3px;
    }
  `;

  constructor() {
    super();
    this.lesson = null;
  }

  _formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  }

  render() {
    if (!this.lesson) {
      return html`<div class="lesson-header">
        <h2 class="section-title">Lesson</h2>
      </div>`;
    }

    return html`
      <div class="lesson-header">
        <h1 class="lesson-title">${this.lesson.title}</h1>
        <div class="lesson-meta">
          <div class="lesson-meta-item">
            <span>Subject:</span> 
            <strong>${this.lesson.subject}</strong>
          </div>
          <div class="lesson-meta-item">
            <span>Grade Level:</span> 
            <strong>${this.lesson.academic_grade}</strong>
          </div>
          <div class="lesson-meta-item">
            <span>Words:</span> 
            <strong>${this.lesson.word_count}</strong>
          </div>
          ${this.lesson.created_at ? html`
            <div class="lesson-meta-item">
              <span>Created:</span> 
              <strong>${this._formatDate(this.lesson.created_at)}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-header')) {
  customElements.define('lesson-header', LessonHeader);
} 