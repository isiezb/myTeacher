import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class LessonQuiz extends LitElement {
  static properties = {
    quiz: { type: Array },
    currentQuizIndex: { type: Number },
    quizAnswers: { type: Array },
    quizCompleted: { type: Boolean },
    limitedQuiz: { type: Array }
  };

  static styles = css`
    .lesson-quiz {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }

    .quiz-title {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: var(--text, #212529);
      font-weight: 600;
    }

    .quiz-item {
      background: var(--secondary-50, #f8f9fa);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .quiz-question {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text, #212529);
    }

    .quiz-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .quiz-option {
      background: white;
      border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
    }

    .quiz-option:hover {
      border-color: var(--primary, #5e7ce6);
      box-shadow: 0 0 0 1px var(--primary, #5e7ce6);
    }

    .quiz-option.selected {
      border-color: var(--primary, #5e7ce6);
      background-color: rgba(94, 124, 230, 0.1);
    }

    .quiz-option.correct {
      border-color: var(--success, #28a745);
      background-color: rgba(40, 167, 69, 0.1);
      transition: all 0.3s ease;
    }

    .quiz-option.incorrect {
      border-color: var(--danger, #dc3545);
      background-color: rgba(220, 53, 69, 0.1);
      transition: all 0.3s ease;
    }

    .quiz-option-marker {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--secondary-100, #eee);
      color: var(--text, #212529);
      margin-right: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .quiz-option.selected .quiz-option-marker {
      background: var(--primary, #5e7ce6);
      color: white;
    }

    .quiz-option.correct .quiz-option-marker {
      background: var(--success, #28a745);
      color: white;
    }

    .quiz-option.incorrect .quiz-option-marker {
      background: var(--danger, #dc3545);
      color: white;
    }

    .quiz-option-text {
      flex-grow: 1;
      color: var(--text, #212529);
    }

    .quiz-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }

    .quiz-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }

    .quiz-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quiz-button.primary {
      background: var(--primary, #5e7ce6);
      color: white;
    }

    .quiz-button.primary:hover:not(:disabled) {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }

    .quiz-button.secondary {
      background: var(--bg, #f8f9fa);
      color: var(--text, #212529);
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
    }

    .quiz-button.secondary:hover:not(:disabled) {
      background: var(--bg-hover, #e9ecef);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }

    .quiz-results {
      text-align: center;
      padding: 2rem;
    }

    .quiz-score {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text, #212529);
      margin-bottom: 1rem;
    }

    .quiz-feedback {
      font-size: 1.125rem;
      color: var(--text-secondary, #6c757d);
      margin-bottom: 2rem;
    }

    .quiz-progress {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .quiz-progress-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--secondary-200, #dee2e6);
      transition: all 0.3s ease;
    }

    .quiz-progress-dot.active {
      background: var(--primary, #5e7ce6);
      transform: scale(1.2);
    }

    .quiz-progress-dot.completed {
      background: var(--success, #28a745);
    }

    @media (max-width: 768px) {
      .quiz-navigation {
        flex-direction: column;
        gap: 1rem;
      }

      .quiz-button {
        width: 100%;
      }
    }
  `;

  constructor() {
    super();
    this.quiz = [];
    this.currentQuizIndex = 0;
    this.quizAnswers = [];
    this.quizCompleted = false;
    this.limitedQuiz = [];
  }

  updated(changedProperties) {
    if (changedProperties.has('quiz')) {
      this.resetQuiz();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.resetQuiz();
  }

  resetQuiz() {
    this.currentQuizIndex = 0;
    this.quizAnswers = [];
    this.quizCompleted = false;
    this.limitedQuiz = this.quiz.slice(0, 5); // Limit to 5 questions
  }

  _handleQuizOptionClick(optionIndex) {
    if (this.quizCompleted) return;

    const currentQuestion = this.limitedQuiz[this.currentQuizIndex];
    if (!currentQuestion) return;

    // Update answer for current question
    this.quizAnswers[this.currentQuizIndex] = optionIndex;

    // Check if answer is correct
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    // Update quiz state
    this.requestUpdate();

    // If this is the last question, complete the quiz
    if (this.currentQuizIndex === this.limitedQuiz.length - 1) {
      this.quizCompleted = true;
      this.dispatchEvent(new CustomEvent('quiz-completed', {
        detail: { score: this._getQuizScore() },
        bubbles: true,
        composed: true
      }));
    }
  }

  _handleNextQuestion() {
    if (this.currentQuizIndex < this.limitedQuiz.length - 1) {
      this.currentQuizIndex++;
      this.requestUpdate();
    }
  }

  _handlePreviousQuestion() {
    if (this.currentQuizIndex > 0) {
      this.currentQuizIndex--;
      this.requestUpdate();
    }
  }

  _handleRestartQuiz() {
    this.resetQuiz();
    this.requestUpdate();
  }

  _handleContinueLearning() {
    this.dispatchEvent(new CustomEvent('continue-lesson', {
      bubbles: true,
      composed: true
    }));
  }

  _getQuizScore() {
    return this.quizAnswers.reduce((score, answer, index) => {
      const question = this.limitedQuiz[index];
      return score + (answer === question.correctAnswer ? 1 : 0);
    }, 0);
  }

  _renderQuizQuestion(question, index) {
    const isCurrentQuestion = index === this.currentQuizIndex;
    const userAnswer = this.quizAnswers[index];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === question.correctAnswer;

    return html`
      <div class="quiz-item">
        <div class="quiz-question">${question.question}</div>
        <div class="quiz-options">
          ${question.options.map((option, optionIndex) => {
            const isSelected = userAnswer === optionIndex;
            const classes = [
              'quiz-option',
              isSelected ? 'selected' : '',
              isAnswered && optionIndex === question.correctAnswer ? 'correct' : '',
              isAnswered && isSelected && !isCorrect ? 'incorrect' : ''
            ].filter(Boolean);

            return html`
              <div
                class=${classes.join(' ')}
                @click=${() => this._handleQuizOptionClick(optionIndex)}
              >
                <div class="quiz-option-marker">
                  ${String.fromCharCode(65 + optionIndex)}
                </div>
                <div class="quiz-option-text">${option}</div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _renderQuizResults() {
    const score = this._getQuizScore();
    const totalQuestions = this.limitedQuiz.length;
    const percentage = (score / totalQuestions) * 100;

    let feedback = '';
    if (percentage >= 80) {
      feedback = 'Excellent work! You have a strong understanding of this lesson.';
    } else if (percentage >= 60) {
      feedback = 'Good job! You understand most of the concepts.';
    } else {
      feedback = 'Keep practicing! You might want to review the lesson content.';
    }

    return html`
      <div class="quiz-results">
        <div class="quiz-score">${score}/${totalQuestions}</div>
        <div class="quiz-feedback">${feedback}</div>
        <button class="quiz-button primary" @click=${this._handleRestartQuiz}>
          Try Again
        </button>
        <button class="quiz-button secondary" @click=${this._handleContinueLearning}>
          Continue Learning
        </button>
      </div>
    `;
  }

  render() {
    if (!this.quiz || this.quiz.length === 0) {
      return html`<div class="lesson-quiz"></div>`;
    }

    return html`
      <div class="lesson-quiz">
        <h2 class="quiz-title">Lesson Quiz</h2>
        
        <div class="quiz-progress">
          ${this.limitedQuiz.map((_, index) => html`
            <div
              class=${[
                'quiz-progress-dot',
                index === this.currentQuizIndex ? 'active' : '',
                index < this.currentQuizIndex ? 'completed' : ''
              ].filter(Boolean).join(' ')}
            ></div>
          `)}
        </div>

        ${this.quizCompleted
          ? this._renderQuizResults()
          : this._renderQuizQuestion(this.limitedQuiz[this.currentQuizIndex], this.currentQuizIndex)
        }

        ${!this.quizCompleted ? html`
          <div class="quiz-navigation">
            <button
              class="quiz-button secondary"
              ?disabled=${this.currentQuizIndex === 0}
              @click=${this._handlePreviousQuestion}
            >
              Previous
            </button>
            <button
              class="quiz-button primary"
              ?disabled=${!this.quizAnswers[this.currentQuizIndex]}
              @click=${this._handleNextQuestion}
            >
              Next
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-quiz')) {
  customElements.define('lesson-quiz', LessonQuiz);
} 