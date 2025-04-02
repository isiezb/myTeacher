import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

export class LessonQuiz extends LitElement {
  static properties = {
    quizData: { type: Array }, // Expects array of QuizItem models
  };

  @state() _userAnswers = {}; // Stores { questionId: selectedOptionId }
  @state() _submitted = false;

  static styles = css`
    :host {
      display: block;
    }
    .question-item {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .question-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .question-text {
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }
    .options-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .option-item label {
      display: block;
      padding: 0.8rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      background-color: #fff;
    }
    .option-item input[type="radio"] {
      margin-right: 0.8em;
      accent-color: var(--primary-color, #4a63b9);
    }
    /* Styling when submitted */
    .option-item label.correct {
      background-color: #e9f7ef;
      border-color: #5cb85c;
      color: #3c763d;
    }
    .option-item label.incorrect {
      background-color: #f8d7da;
      border-color: #d9534f;
      color: #a94442;
    }
     .option-item label.selected:not(.correct):not(.incorrect) { /* Style selected before submit */
        background-color: #e7e9fd;
        border-color: var(--primary-color, #4a63b9);
    }
     /* Hide radio button visually but keep it accessible */
    .option-item input[type="radio"] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
    button {
        display: block;
        margin: 2rem auto 0 auto;
        padding: 0.75rem 1.5rem;
        background-color: var(--primary-color, #4a63b9);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
    }
    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    .results {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #f1f3f5;
        border-radius: 4px;
        text-align: center;
        font-weight: bold;
    }
  `;

  constructor() {
    super();
    this.quizData = [];
    this._userAnswers = {};
    this._submitted = false;
  }

  _handleOptionChange(questionId, optionId) {
    if (this._submitted) return; // Don't allow changes after submission
    this._userAnswers = {
      ...this._userAnswers,
      [questionId]: optionId,
    };
     this.requestUpdate(); // Update rendering to show selection style
  }

  _handleSubmitQuiz() {
    this._submitted = true;
    // Optionally, calculate score or dispatch an event
    console.log("Quiz submitted:", this._userAnswers);
    this.requestUpdate(); // Re-render to show results/feedback
  }

  _isCorrect(question, selectedOptionId) {
    return question.correct_option_id === selectedOptionId;
  }

   _getScore() {
    let correctCount = 0;
    this.quizData.forEach(q => {
        if (this._userAnswers[q.id] && this._isCorrect(q, this._userAnswers[q.id])) {
            correctCount++;
        }
    });
    return `${correctCount} / ${this.quizData.length}`;
  }

  render() {
    if (!this.quizData || this.quizData.length === 0) {
      return html`<p>No quiz questions provided.</p>`;
    }

    return html`
      ${map(this.quizData, (question, index) => html`
        <div class="question-item">
          <div class="question-text">${index + 1}. ${question.question}</div>
          <ul class="options-list">
            ${map(question.options, (option) => {
              const isSelected = this._userAnswers[question.id] === option.id;
              let labelClass = '';
              if (this._submitted) {
                if (this._isCorrect(question, option.id)) {
                  labelClass = 'correct'; // Always highlight correct green
                } else if (isSelected) {
                  labelClass = 'incorrect'; // Highlight selected incorrect red
                }
              } else if (isSelected) {
                    labelClass = 'selected'; // Highlight selected blue before submit
              }

              return html`
                <li class="option-item">
                  <label class="${labelClass}">
                    <input
                      type="radio"
                      name="question_${question.id}"
                      value=${option.id}
                      .checked=${isSelected}
                      @change=${() => this._handleOptionChange(question.id, option.id)}
                      ?disabled=${this._submitted}
                    >
                    ${option.text}
                     ${this._submitted && this._isCorrect(question, option.id) ? ' ✔️' : ''}
                     ${this._submitted && isSelected && !this._isCorrect(question, option.id) ? ' ❌' : ''}
                  </label>
                </li>
              `;
            })}
          </ul>
        </div>
      `)}

      ${!this._submitted ? html`
        <button @click=${this._handleSubmitQuiz}>Submit Quiz</button>
      ` : html`
        <div class="results">Quiz Submitted! Score: ${this._getScore()}</div>
      `}
    `;
  }
}

customElements.define('lesson-quiz', LessonQuiz); 