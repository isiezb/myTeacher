import { LitElement, html, css } from 'lit';

class StoryQuiz extends LitElement {
  static properties = {
    quiz: { type: Array },
    currentQuizIndex: { type: Number },
    quizAnswers: { type: Array },
    quizCompleted: { type: Boolean }
  };

  static styles = css`
    .story-quiz {
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
      transition: all 0.2s ease;
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
    }

    .quiz-option.incorrect {
      border-color: var(--danger, #dc3545);
      background-color: rgba(220, 53, 69, 0.1);
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

    .quiz-navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }

    .quiz-results {
      background: var(--secondary-50, #f8f9fa);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }

    .quiz-results-score {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .quiz-results-message {
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }

    .quiz-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: var(--text-secondary, #6c757d);
    }

    .btn {
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background-color: var(--primary, #5e7ce6);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--primary-dark, #4a63b8);
    }

    .btn-secondary {
      background-color: var(--secondary, #6c757d);
      color: white;
    }

    .btn-secondary:hover {
      background-color: var(--secondary-dark, #495057);
    }

    .btn-success {
      background-color: var(--success, #28a745);
      color: white;
    }

    .btn-success:hover {
      background-color: var(--success-dark, #218838);
    }
  `;

  constructor() {
    super();
    this.quiz = [];
    this.currentQuizIndex = 0;
    this.quizAnswers = [];
    this.quizCompleted = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.resetQuiz();
  }

  resetQuiz() {
    this.currentQuizIndex = 0;
    this.quizAnswers = this.quiz ? Array(this.quiz.length).fill(null) : [];
    this.quizCompleted = false;
  }

  _handleQuizOptionClick(optionIndex) {
    if (this.quizCompleted) return;
    
    // Update the answer for the current question
    const newAnswers = [...this.quizAnswers];
    newAnswers[this.currentQuizIndex] = optionIndex;
    this.quizAnswers = newAnswers;
    
    // Check if all questions have been answered
    if (this.currentQuizIndex === this.quiz.length - 1) {
      this.quizCompleted = true;
    } else {
      // Move to the next question after a short delay
      setTimeout(() => {
        this.currentQuizIndex++;
      }, 500);
    }
  }

  _handleNextQuestion() {
    if (this.currentQuizIndex < this.quiz.length - 1) {
      this.currentQuizIndex++;
    }
  }

  _handlePreviousQuestion() {
    if (this.currentQuizIndex > 0) {
      this.currentQuizIndex--;
    }
  }

  _handleRestartQuiz() {
    this.resetQuiz();
  }

  _getQuizScore() {
    if (!this.quiz || this.quiz.length === 0) return 0;
    
    let correctAnswers = 0;
    this.quiz.forEach((question, index) => {
      if (this.quizAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    return {
      score: correctAnswers,
      total: this.quiz.length,
      percentage: Math.round((correctAnswers / this.quiz.length) * 100)
    };
  }

  _renderQuizQuestion(question, index) {
    const isCurrentQuestion = index === this.currentQuizIndex;
    const userAnswer = this.quizAnswers[index];
    const isAnswered = userAnswer !== null;
    const correctAnswer = question.correct_answer;
    
    return html`
      <div class="quiz-item" style="${isCurrentQuestion ? '' : 'display: none;'}">
        <div class="quiz-progress">Question ${index + 1} of ${this.quiz.length}</div>
        <div class="quiz-question">${question.question}</div>
        <div class="quiz-options">
          ${question.options.map((option, optionIndex) => {
            let optionClass = '';
            
            if (isAnswered && this.quizCompleted) {
              if (optionIndex === correctAnswer) {
                optionClass = 'correct';
              } else if (userAnswer === optionIndex && userAnswer !== correctAnswer) {
                optionClass = 'incorrect';
              }
            } else if (userAnswer === optionIndex) {
              optionClass = 'selected';
            }
            
            return html`
              <div 
                class="quiz-option ${optionClass}"
                @click="${() => this._handleQuizOptionClick(optionIndex)}"
              >
                <div class="quiz-option-marker">${String.fromCharCode(65 + optionIndex)}</div>
                <div>${option}</div>
              </div>
            `;
          })}
        </div>
        
        ${!this.quizCompleted ? html`
          <div class="quiz-navigation">
            <button 
              class="btn btn-secondary" 
              ?disabled="${this.currentQuizIndex === 0}"
              @click="${this._handlePreviousQuestion}"
            >Previous</button>
            <button 
              class="btn btn-primary" 
              ?disabled="${this.currentQuizIndex === this.quiz.length - 1 || !isAnswered}"
              @click="${this._handleNextQuestion}"
            >Next</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderQuizResults() {
    const result = this._getQuizScore();
    let message = '';
    
    if (result.percentage >= 80) {
      message = 'Great job! You have a strong understanding of the story.';
    } else if (result.percentage >= 60) {
      message = 'Good work! You understood most of the key points.';
    } else {
      message = 'You might want to review the story again to improve your understanding.';
    }
    
    return html`
      <div class="quiz-results">
        <div class="quiz-results-score">${result.score}/${result.total} (${result.percentage}%)</div>
        <div class="quiz-results-message">${message}</div>
        <button class="btn btn-primary" @click="${this._handleRestartQuiz}">Restart Quiz</button>
      </div>
    `;
  }

  render() {
    if (!this.quiz || this.quiz.length === 0) {
      return html``;
    }

    return html`
      <div class="story-quiz">
        <h3 class="quiz-title">Comprehension Quiz</h3>
        
        ${this.quizCompleted ? 
          this._renderQuizResults() : 
          this.quiz.map((question, index) => this._renderQuizQuestion(question, index))
        }
      </div>
    `;
  }
}

customElements.define('story-quiz', StoryQuiz);