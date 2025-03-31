import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class StoryQuiz extends LitElement {
  static properties = {
    quiz: { type: Array },
    currentQuizIndex: { type: Number },
    quizAnswers: { type: Array },
    quizCompleted: { type: Boolean },
    limitedQuiz: { type: Array }
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

    .feedback-message {
      background-color: white;
      border-radius: 8px;
      padding: 0.75rem;
      margin-top: 1rem;
      font-weight: 500;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
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
      margin: 0 0.5rem;
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
    
    .btn-container {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }
  `;

  constructor() {
    super();
    this.quiz = [];
    this.limitedQuiz = [];
    this.currentQuizIndex = 0;
    this.quizAnswers = [];
    this.quizCompleted = false;
  }
  
  updated(changedProperties) {
    if (changedProperties.has('quiz') && this.quiz) {
      // Limit the quiz to 3 questions
      this.limitedQuiz = this.quiz.slice(0, 3);
      this.resetQuiz();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.resetQuiz();
  }

  resetQuiz() {
    this.currentQuizIndex = 0;
    this.quizAnswers = this.limitedQuiz ? Array(this.limitedQuiz.length).fill(null) : [];
    this.quizCompleted = false;
  }

  _handleQuizOptionClick(optionIndex) {
    if (this.quizCompleted) return;
    
    // Update the answer for the current question
    const newAnswers = [...this.quizAnswers];
    newAnswers[this.currentQuizIndex] = optionIndex;
    this.quizAnswers = newAnswers;
    
    // Get the current question
    const currentQuestion = this.limitedQuiz[this.currentQuizIndex];
    const isCorrect = optionIndex === currentQuestion.correct_answer;
    
    // Show immediate feedback and delay moving to the next question
    setTimeout(() => {
      // Check if all questions have been answered
      if (this.currentQuizIndex === this.limitedQuiz.length - 1) {
        this.quizCompleted = true;
      } else {
        // Move to the next question after showing feedback
        this.currentQuizIndex++;
      }
    }, 1500); // Allow 1.5 seconds to see the feedback
  }

  _handleNextQuestion() {
    if (this.currentQuizIndex < this.limitedQuiz.length - 1) {
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
  
  _handleContinueLearning() {
    console.log('Continue Learning button clicked in quiz component');
    
    // Get the current story from the window object
    const story = window.currentStory;
    
    // Make sure the quiz data is explicitly included
    if (story && this.quiz && this.quiz.length > 0) {
      if (!story.quiz || story.quiz.length === 0) {
        story.quiz = this.quiz;
        console.log('Added quiz data to story for continuation:', this.quiz);
      }
    }
    
    // Dispatch a continue-story event with the story detail
    this.dispatchEvent(new CustomEvent('continue-story', {
      detail: { story },
      bubbles: true,
      composed: true
    }));
  }

  _getQuizScore() {
    if (!this.limitedQuiz || this.limitedQuiz.length === 0) return 0;
    
    let correctAnswers = 0;
    this.limitedQuiz.forEach((question, index) => {
      if (this.quizAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    return {
      score: correctAnswers,
      total: this.limitedQuiz.length,
      percentage: Math.round((correctAnswers / this.limitedQuiz.length) * 100)
    };
  }

  _renderQuizQuestion(question, index) {
    const isCurrentQuestion = index === this.currentQuizIndex;
    const userAnswer = this.quizAnswers[index];
    const isAnswered = userAnswer !== null;
    const correctAnswer = question.correct_answer;
    
    return html`
      <div class="quiz-item" style="${isCurrentQuestion ? '' : 'display: none;'}">
        <div class="quiz-progress">Question ${index + 1} of ${this.limitedQuiz.length}</div>
        <div class="quiz-question">${question.question}</div>
        <div class="quiz-options">
          ${question.options.map((option, optionIndex) => {
            let optionClass = '';
            
            // Show immediate feedback for the current question after answering
            if (isAnswered) {
              if (optionIndex === correctAnswer) {
                optionClass = 'correct';
              } else if (userAnswer === optionIndex && userAnswer !== correctAnswer) {
                optionClass = 'incorrect';
              } else if (userAnswer === optionIndex) {
                optionClass = 'selected';
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
        
        ${isAnswered && isCurrentQuestion ? html`
          <div class="feedback-message" style="text-align: center; margin-top: 1rem; font-weight: 500; ${userAnswer === correctAnswer ? 'color: var(--success, #28a745);' : 'color: var(--danger, #dc3545);'}">
            ${userAnswer === correctAnswer ? 
              'Correct! Well done.' : 
              `Incorrect. The correct answer is ${String.fromCharCode(65 + correctAnswer)}: ${question.options[correctAnswer]}.`}
          </div>
        ` : ''}
        
        ${!this.quizCompleted ? html`
          <div class="quiz-navigation">
            <button 
              class="btn btn-secondary" 
              ?disabled="${this.currentQuizIndex === 0}"
              @click="${this._handlePreviousQuestion}"
            >Previous</button>
            <button 
              class="btn btn-primary" 
              ?disabled="${this.currentQuizIndex === this.limitedQuiz.length - 1 || !isAnswered}"
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
        <div class="quiz-results-message" style="margin-top: 1rem; font-weight: 600; color: var(--primary, #5e7ce6);">
          Ready to continue your learning journey?
        </div>
        <div class="btn-container">
          <button class="btn btn-secondary" @click="${this._handleRestartQuiz}">Restart Quiz</button>
          <button class="btn btn-primary quiz-continue-button continue-button" 
                  style="font-size: 1.1rem; font-weight: 700; padding: 0.85rem 1.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                  @click="${this._handleContinueLearning}">Continue Learning</button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.limitedQuiz || this.limitedQuiz.length === 0) {
      return html``;
    }

    return html`
      <div class="story-quiz">
        ${this.quizCompleted ? 
          this._renderQuizResults() : 
          this.limitedQuiz.map((question, index) => this._renderQuizQuestion(question, index))
        }
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('story-quiz')) {
  customElements.define('story-quiz', StoryQuiz);
}