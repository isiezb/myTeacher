import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';
import '/components/quiz/quiz-question.js';
import '/components/quiz/quiz-results.js';

export class QuizComponent extends LitElement {
  static get properties() {
    return {
      quiz: { type: Object },
      showResults: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.quiz = null;
    this.showResults = false;
    this._selectedAnswers = {};
    this._score = 0;
    this._showFeedback = false;
    this._correctAnswers = 0;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      }

      .quiz-container {
        background: var(--card-bg, white);
        border-radius: 24px;
        padding: 2.5rem;
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        margin-bottom: 2rem;
      }

      h3 {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 700;
        font-size: 1.5rem;
        margin: 0 0 1.5rem;
        color: var(--primary, #5e7ce6);
      }

      .quiz-actions {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
      }

      button {
        padding: 0.875rem 1.75rem;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        background: var(--primary, #5e7ce6);
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: var(--font-heading, 'Inter', sans-serif);
      }

      button:hover {
        background: var(--primary-600, #4a63b9);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      }

      button:disabled {
        background: var(--gray-500, #adb5bd);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      @media (max-width: 768px) {
        .quiz-container {
          padding: 1.5rem;
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._resetQuiz();
  }

  _resetQuiz() {
    if (this.quiz && this.quiz.questions) {
      this._selectedAnswers = {};
      this._score = 0;
      this._showFeedback = false;
      this._correctAnswers = 0;
    }
  }

  _handleOptionSelected(e) {
    if (this.showResults) return;
    
    const { questionIndex, optionIndex } = e.detail;
    
    this._selectedAnswers = {
      ...this._selectedAnswers,
      [questionIndex]: optionIndex
    };
    
    this.requestUpdate();
  }

  _checkAnswers() {
    if (!this.quiz || !this.quiz.questions) return;
    
    let correctCount = 0;
    const totalQuestions = this.quiz.questions.length;
    
    for (let i = 0; i < totalQuestions; i++) {
      const selectedOption = this._selectedAnswers[i];
      const correctOption = this.quiz.questions[i].correctAnswer;
      
      if (selectedOption === correctOption) {
        correctCount++;
      }
    }
    
    this._correctAnswers = correctCount;
    this._score = Math.round((correctCount / totalQuestions) * 100);
    this._showFeedback = true;
    this.showResults = true;
    
    // Dispatch event with quiz results
    this.dispatchEvent(new CustomEvent('quiz-completed', {
      detail: {
        score: this._score,
        totalQuestions,
        correctAnswers: correctCount
      },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  _retakeQuiz() {
    this._resetQuiz();
    this.showResults = false;
    this.requestUpdate();
  }

  render() {
    if (!this.quiz || !this.quiz.questions || this.quiz.questions.length === 0) {
      return html`<div>No quiz data available</div>`;
    }

    return html`
      <div class="quiz-container">
        <h3>${this.quiz.title || 'Quiz'}</h3>
        
        ${this.quiz.questions.map((question, index) => html`
          <quiz-question
            .question=${question}
            .index=${index}
            .selectedOption=${this._selectedAnswers[index]}
            ?showResults=${this.showResults}
            ?showFeedback=${this._showFeedback}
            @option-selected=${this._handleOptionSelected}
          ></quiz-question>
        `)}
        
        <div class="quiz-actions">
          ${this.showResults 
            ? html`<button @click=${this._retakeQuiz}>Retake Quiz</button>` 
            : html`<button @click=${this._checkAnswers} ?disabled=${Object.keys(this._selectedAnswers).length < this.quiz.questions.length}>Check Answers</button>`
          }
        </div>
        
        ${this.showResults ? html`
          <quiz-results
            .score=${this._score}
            .correctAnswers=${this._correctAnswers}
            .totalQuestions=${this.quiz.questions.length}
          ></quiz-results>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('quiz-component')) {
  customElements.define('quiz-component', QuizComponent);
} 