import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './lesson-card.js';

export class LessonList extends LitElement {
  static get properties() {
    return {
      lessons: { type: Array }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .lessons-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary, #6c757d);
      }

      .empty-state-title {
        font-size: 1.5rem;
        margin: 0 0 1rem 0;
      }

      .empty-state-message {
        font-size: 1.125rem;
        margin: 0;
      }

      @media (max-width: 768px) {
        .lessons-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  constructor() {
    super();
    this.lessons = [];
  }

  render() {
    if (!this.lessons?.length) {
      return html`
        <div class="empty-state">
          <h2 class="empty-state-title">No Lessons Yet</h2>
          <p class="empty-state-message">Create your first lesson to get started!</p>
        </div>
      `;
    }

    return html`
      <div class="lessons-grid">
        ${this.lessons.map(lesson => html`
          <lesson-card
            .lesson=${lesson}
            .showActions=${true}
            @view-lesson=${(e) => this.dispatchEvent(new CustomEvent('view-lesson', {
              detail: { lessonId: lesson.id },
              bubbles: true,
              composed: true
            }))}
            @delete-lesson=${(e) => this.dispatchEvent(new CustomEvent('delete-lesson', {
              detail: { lessonId: lesson.id },
              bubbles: true,
              composed: true
            }))}
          ></lesson-card>
        `)}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-list')) {
  customElements.define('lesson-list', LessonList);
} 