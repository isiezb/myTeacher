import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class QuizResults extends LitElement {
  static get properties() {
    return {
      score: { type: Number },
      correctAnswers: { type: Number },
      totalQuestions: { type: Number },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .quiz-results {
        text-align: center;
        padding: 2rem;
        background: var(--bg, #f8f9fa);
        border-radius: 12px;
        margin-top: 1.5rem;
        animation: fadeIn 0.5s ease-in-out;
      }

      .quiz-score {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary, #5e7ce6);
        margin-bottom: 0.5rem;
      }

      .quiz-score-text {
        font-size: 1.125rem;
        color: var(--text, #212529);
        margin-bottom: 1.5rem;
      }

      .quiz-feedback {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--text-secondary, #6c757d);
      }

      .error-message {
        color: var(--error, #dc3545);
        padding: 1rem;
        border: 1px solid currentColor;
        border-radius: 8px;
        margin: 1rem 0;
      }

      .loading {
        opacity: 0.7;
        pointer-events: none;
      }

      /* High contrast mode support */
      @media (forced-colors: active) {
        .quiz-results {
          border: 2px solid CanvasText;
        }
        .quiz-score {
          color: CanvasText;
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  constructor() {
    super();
    this.score = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 0;
    this.loading = false;
    this.error = '';
  }

  _getScoreFeedback(score) {
    if (score >= 90) return "Excellent! You have a great understanding of the topic.";
    if (score >= 75) return "Well done! You've understood most of the key concepts.";
    if (score >= 60) return "Good job! There's still some room for improvement.";
    return "Keep studying! Try reviewing the content and taking the quiz again.";
  }

  _getScoreDescription(score) {
    return `Your score is ${score} percent, which means ${this._getScoreFeedback(score).toLowerCase()}`;
  }

  render() {
    if (this.error) {
      return html`
        <div class="quiz-results" role="alert">
          <div class="error-message">
            ${this.error}
          </div>
        </div>
      `;
    }

    const resultClass = this.loading ? 'quiz-results loading' : 'quiz-results';
    const scoreDescription = this._getScoreDescription(this.score);

    return html`
      <div 
        class="${resultClass}"
        role="region" 
        aria-label="Quiz Results"
        aria-live="polite"
      >
        <div class="quiz-score" role="heading" aria-level="2">
          Score: ${this.score}%
        </div>
        <div 
          class="quiz-score-text"
          aria-label="${scoreDescription}"
        >
          You got ${this.correctAnswers} out of ${this.totalQuestions} questions correct.
        </div>
        <div class="quiz-feedback">
          ${this._getScoreFeedback(this.score)}
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('quiz-results')) {
  customElements.define('quiz-results', QuizResults);
} 