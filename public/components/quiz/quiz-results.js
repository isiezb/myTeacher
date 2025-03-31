import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class QuizResults extends LitElement {
  static get properties() {
    return {
      score: { type: Number },
      correctAnswers: { type: Number },
      totalQuestions: { type: Number }
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
  }

  _getScoreFeedback(score) {
    if (score >= 90) return "Excellent! You have a great understanding of the topic.";
    if (score >= 75) return "Well done! You've understood most of the key concepts.";
    if (score >= 60) return "Good job! There's still some room for improvement.";
    return "Keep studying! Try reviewing the content and taking the quiz again.";
  }

  render() {
    return html`
      <div class="quiz-results">
        <div class="quiz-score">Score: ${this.score}%</div>
        <div class="quiz-score-text">
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