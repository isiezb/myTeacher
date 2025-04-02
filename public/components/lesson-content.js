import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './lesson/lesson-header.js';
import './lesson/lesson-text.js';
import './lesson/lesson-summary.js';
import './lesson/lesson-vocabulary.js';
import './lesson/lesson-quiz.js';

export class LessonContent extends LitElement {
  static properties = {
    lesson: { type: Object },
    showHeader: { type: Boolean },
    showSummary: { type: Boolean },
    showVocabulary: { type: Boolean },
    showQuiz: { type: Boolean }
  };

  static styles = css`
    .lesson-content-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--text-secondary, #6c757d);
      font-style: italic;
    }
    
    .continue-button {
      display: block;
      margin: 2rem auto 1rem auto;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background: var(--primary, #5e7ce6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .continue-button:hover {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }
    
    .button-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }
    
    .restart-button {
      display: block;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text, #212529);
      background: var(--bg, #f8f9fa);
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .restart-button:hover {
      background: var(--bg-hover, #e9ecef);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }
  `;

  constructor() {
    super();
    this.lesson = null;
    this.showHeader = true;
    this.showSummary = true;
    this.showVocabulary = true;
    this.showQuiz = true;
  }

  firstUpdated() {
    // Initial scrolling when component is first rendered
    this._scrollToLessonContent();
  }

  _scrollToLessonContent() {
    // If there's a lesson, scroll to its first paragraph
    if (this.lesson) {
      setTimeout(() => {
        const firstParagraph = this.shadowRoot.querySelector('lesson-text');
        if (firstParagraph) {
          firstParagraph.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  updated(changedProperties) {
    // Scroll to content when lesson changes
    if (changedProperties.has('lesson')) {
      this._scrollToLessonContent();
    }
  }

  _handleContinueLesson(e) {
    // Dispatch event to parent
    this.dispatchEvent(new CustomEvent('continue-lesson', {
      detail: { lessonId: this.lesson.id },
      bubbles: true,
      composed: true
    }));
  }

  _handleRestartLesson(e) {
    // Dispatch event to parent
    this.dispatchEvent(new CustomEvent('restart-lesson', {
      detail: { lessonId: this.lesson.id },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.lesson) {
      return html`<div class="empty-state">No lesson to display</div>`;
    }

    return html`
      <div class="lesson-content-container">
        ${this.showHeader ? html`
          <lesson-header
            .lesson=${this.lesson}
          ></lesson-header>
        ` : ''}

        <lesson-text
          .content=${this.lesson.content}
        ></lesson-text>

        ${this.showSummary && this.lesson.summary ? html`
          <lesson-summary
            .summary=${this.lesson.summary}
          ></lesson-summary>
        ` : ''}

        ${this.showVocabulary && this.lesson.vocabulary ? html`
          <lesson-vocabulary
            .vocabulary=${this.lesson.vocabulary}
          ></lesson-vocabulary>
        ` : ''}

        ${this.showQuiz && this.lesson.quiz ? html`
          <lesson-quiz
            .quiz=${this.lesson.quiz}
          ></lesson-quiz>
        ` : ''}

        <div class="button-container">
          ${html`<button class="continue-button" @click=${this._handleContinueLesson}>
            Continue Lesson
          </button>`}
          
          ${html`<button class="restart-button" @click=${this._handleRestartLesson}>
            Start New Lesson
          </button>`}
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-content')) {
  customElements.define('lesson-content', LessonContent);
} 