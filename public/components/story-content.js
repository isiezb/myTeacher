import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class StoryContent extends LitElement {
  static get properties() {
    return {
      story: { type: Object },
      showHeader: { type: Boolean },
      showSummary: { type: Boolean },
      showVocabulary: { type: Boolean },
      showQuiz: { type: Boolean },
      currentQuizIndex: { type: Number },
      quizAnswers: { type: Array },
      quizCompleted: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.story = null;
    this.showHeader = true;
    this.showSummary = true;
    this.showVocabulary = true;
    this.showQuiz = true;
    this.currentQuizIndex = 0;
    this.quizAnswers = [];
    this.quizCompleted = false;
  }

  static get styles() {
    return css`
      /* Component container */
      .story-content-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 1.5rem;
        margin-bottom: 2rem;
      }

      /* Header styling */
      .story-header {
        margin-bottom: 1.5rem;
      }

      .story-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 2rem;
        color: var(--text, #212529);
        margin: 0 0 1rem 0;
      }

      .story-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        color: var(--text-secondary, #6c757d);
        font-size: 0.875rem;
      }

      .story-meta-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      /* Summary styling */
      .story-summary {
        background: var(--secondary-50, #f8f9fa);
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        border-left: 4px solid var(--secondary, #6c757d);
      }

      .summary-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: var(--text, #212529);
      }

      .summary-text {
        color: var(--text, #212529);
        line-height: 1.5;
        margin: 0;
      }

      /* Main story content */
      .story-text {
        line-height: 1.8;
        color: var(--text, #212529);
        margin-bottom: 1.5rem;
      }

      .story-text p {
        margin-bottom: 1.25rem;
      }

      /* Vocabulary styling */
      .story-vocabulary {
        margin-top: 2rem;
        margin-bottom: 2rem;
      }

      .vocabulary-title {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: var(--text, #212529);
      }

      .vocabulary-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .vocabulary-item {
        background: var(--secondary-50, #f8f9fa);
        border-radius: 8px;
        padding: 1rem;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }

      .vocabulary-term {
        font-weight: 600;
        color: var(--primary, #5e7ce6);
        margin-bottom: 0.5rem;
      }

      .vocabulary-definition {
        color: var(--text, #212529);
        font-size: 0.9375rem;
        line-height: 1.5;
      }

      /* Quiz styling */
      .story-quiz {
        margin-top: 3rem;
      }

      .quiz-title {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: var(--text, #212529);
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
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .quiz-option.selected {
        border-width: 2px;
      }

      .quiz-option.correct {
        border-color: var(--success, #22c55e);
        background-color: var(--success-50, #f0fdf4);
      }

      .quiz-option.incorrect {
        border-color: var(--danger, #ef4444);
        background-color: var(--danger-50, #fef2f2);
      }

      .quiz-option-index {
        font-weight: 600;
        margin-right: 0.75rem;
        color: var(--text-secondary, #6c757d);
      }

      .quiz-option-text {
        flex: 1;
      }

      .quiz-navigation {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
      }
      
      .quiz-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .quiz-button {
        padding: 0.75rem 1.5rem;
        background: var(--primary, #5e7ce6);
        color: white;
        border: none;
        border-radius: 8px;
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .quiz-button:hover {
        background: var(--primary-dark, #4b63b8);
        transform: translateY(-1px);
      }

      .quiz-button:disabled {
        background: var(--text-secondary, #6c757d);
        cursor: not-allowed;
        transform: none;
      }

      .quiz-button.secondary {
        background: var(--bg, #f8f9fa);
        color: var(--text, #212529);
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }

      .quiz-button.secondary:hover {
        background: var(--primary-50, #eef2ff);
      }

      .quiz-progress {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
        margin-top: 2rem;
      }

      .quiz-progress-item {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--border, rgba(0, 0, 0, 0.1));
        margin: 0 0.35rem;
        transition: background-color 0.3s ease;
      }

      .quiz-progress-item.active {
        background: var(--primary, #5e7ce6);
      }

      .quiz-progress-item.answered {
        background: var(--success, #22c55e);
      }

      .quiz-results {
        text-align: center;
        padding: 2rem;
        background: var(--primary-50, #eef2ff);
        border-radius: 12px;
      }

      .quiz-score {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary, #5e7ce6);
        margin-bottom: 1rem;
      }

      .quiz-feedback {
        font-size: 1.125rem;
        margin-bottom: 2rem;
      }

      .quiz-restart-button {
        padding: 0.75rem 1.5rem;
        background: var(--primary, #5e7ce6);
        color: white;
        border: none;
        border-radius: 8px;
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .quiz-continue-button {
        padding: 0.75rem 1.5rem;
        background-color: var(--success, #22c55e);
        color: white;
        border: none;
        border-radius: 8px;
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .quiz-continue-button:hover {
        background-color: var(--success-dark, #16a34a);
        transform: translateY(-1px);
      }

      .quiz-option-indicator {
        margin-left: 8px;
        font-weight: bold;
      }
      
      .quiz-feedback-message {
        margin-top: 16px;
        padding: 12px;
        border-radius: 8px;
        font-weight: 500;
        text-align: center;
        animation: fadeIn 0.3s ease;
      }
      
      .quiz-feedback-correct {
        background-color: var(--success-50, #dcfce7);
        color: var(--success-700, #15803d);
        border: 1px solid var(--success-200, #bbf7d0);
      }
      
      .quiz-feedback-incorrect {
        background-color: var(--danger-50, #fee2e2);
        color: var(--danger-700, #b91c1c);
        border: 1px solid var(--danger-200, #fecaca);
      }
      
      .highlight-correct {
        animation: pulse 1.5s infinite;
        border: 2px solid var(--success, #22c55e);
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
        }
        70% {
          box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .quiz-error {
        padding: 1rem;
        background-color: var(--danger-100, #fee2e2);
        border-radius: 8px;
        border: 1px solid var(--danger, #ef4444);
        color: var(--danger-dark, #b91c1c);
        margin-bottom: 1rem;
        font-size: 0.9375rem;
      }

      @media (max-width: 768px) {
        .story-content-container {
          padding: 1.5rem;
        }

        .story-title {
          font-size: 1.75rem;
        }

        .vocabulary-list {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  firstUpdated() {
    try {
      if (this.story && this.story.quiz && Array.isArray(this.story.quiz) && this.story.quiz.length > 0) {
        this.quizAnswers = new Array(this.story.quiz.length).fill(null);
      } else if (this.story && this.story.quiz) {
        console.warn('Quiz data is not an array or is empty:', this.story.quiz);
        this.quizAnswers = [];
      }
    } catch (error) {
      console.error('Error in firstUpdated handling quiz data:', error);
      this.quizAnswers = [];
    }
  }

  updated(changedProperties) {
    try {
      if (changedProperties.has('story') && this.story) {
        if (this.story.quiz && Array.isArray(this.story.quiz) && this.story.quiz.length > 0) {
          // Limit quiz to max 3 questions
          const limitedQuiz = this.story.quiz.slice(0, 3);
          this.story.quiz = limitedQuiz;
          
          this.quizAnswers = new Array(this.story.quiz.length).fill(null);
          this.currentQuizIndex = 0;
          this.quizCompleted = false;
        } else if (this.story.quiz) {
          console.warn('Updated with invalid quiz data:', this.story.quiz);
          this.quizAnswers = [];
        }
      }
    } catch (error) {
      console.error('Error in updated handling quiz data:', error);
      this.quizAnswers = [];
      this.currentQuizIndex = 0;
    }
  }

  _formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  _renderVocabulary() {
    if (!this.story.vocabulary || !this.story.vocabulary.length) {
      return html`<p>No vocabulary available for this story.</p>`;
    }

    return html`
      <div class="vocabulary-list">
        ${this.story.vocabulary.map(item => html`
          <div class="vocabulary-item">
            <div class="vocabulary-term">${item.term}</div>
            <div class="vocabulary-definition">${item.definition}</div>
          </div>
        `)}
      </div>
    `;
  }

  _handleQuizOptionClick(optionIndex) {
    try {
      if (!this.story || !this.story.quiz || !Array.isArray(this.story.quiz) || this.currentQuizIndex >= this.story.quiz.length) {
        console.error('Cannot handle quiz option click: invalid quiz data or index');
        return;
      }
      
      const currentQuestion = this.story.quiz[this.currentQuizIndex];
      if (!currentQuestion || typeof currentQuestion.correct_answer !== 'number') {
        console.error('Invalid question format, cannot determine correct answer:', currentQuestion);
        return;
      }
      
      const isCorrect = optionIndex === currentQuestion.correct_answer;
      
      // Update quiz answers
      this.quizAnswers[this.currentQuizIndex] = {
        selectedIndex: optionIndex,
        isCorrect: isCorrect
      };
      
      // Automatically move to next question after a short delay
      // to allow user to see the feedback
      setTimeout(() => {
        if (this.currentQuizIndex < this.story.quiz.length - 1) {
          this._handleNextQuestion();
        } else {
          this.quizCompleted = true;
          this.requestUpdate();
        }
      }, 1000);
      
      this.requestUpdate();
    } catch (error) {
      console.error('Error handling quiz option click:', error);
    }
  }

  _handleNextQuestion() {
    if (this.currentQuizIndex < this.story.quiz.length - 1) {
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
    this.quizAnswers = new Array(this.story.quiz.length).fill(null);
    this.currentQuizIndex = 0;
    this.quizCompleted = false;
    this.requestUpdate();
  }

  _getQuizScore() {
    try {
      if (!this.story || !this.story.quiz || !Array.isArray(this.story.quiz) || this.story.quiz.length === 0) {
        return { correct: 0, total: 0, percentage: 0 };
      }
      
      if (!this.quizAnswers || !Array.isArray(this.quizAnswers)) {
        return { correct: 0, total: this.story.quiz.length, percentage: 0 };
      }
      
      const correctAnswers = this.quizAnswers.filter(answer => answer && answer.isCorrect).length;
      return {
        correct: correctAnswers,
        total: this.story.quiz.length,
        percentage: Math.round((correctAnswers / this.story.quiz.length) * 100)
      };
    } catch (error) {
      console.error('Error calculating quiz score:', error);
      return { correct: 0, total: 0, percentage: 0 };
    }
  }

  _renderQuizQuestion(question, index) {
    try {
      // Safety check for malformed question
      if (!question || typeof question !== 'object') {
        console.error('Invalid quiz question format:', question);
        return html`<div class="quiz-error">Error: Invalid question format (null or not an object)</div>`;
      }
      
      // Ensure question has required properties
      if (!question.question || typeof question.question !== 'string') {
        console.error('Quiz question missing "question" property or not a string:', question);
        return html`<div class="quiz-error">Error: Quiz question is missing the question text</div>`;
      }
      
      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        console.error('Quiz question missing "options" property or not a valid array:', question);
        return html`<div class="quiz-error">Error: Quiz question is missing answer options</div>`;
      }
      
      if (typeof question.correct_answer !== 'number' || 
          question.correct_answer < 0 || 
          question.correct_answer >= question.options.length) {
        console.error('Quiz question has invalid "correct_answer" property:', question);
        return html`<div class="quiz-error">Error: Quiz question has an invalid correct answer index</div>`;
      }
      
      // Safely get user answer
      let userAnswer = null;
      if (Array.isArray(this.quizAnswers) && index >= 0 && index < this.quizAnswers.length) {
        userAnswer = this.quizAnswers[index];
      }
      
      const showResults = userAnswer !== null;
      
      return html`
        <div class="quiz-question">${index + 1}. ${question.question}</div>
        <div class="quiz-options">
          ${question.options.map((option, optionIndex) => {
            if (typeof option !== 'string') {
              console.warn(`Quiz option at index ${optionIndex} is not a string:`, option);
              option = String(option || '');
            }
            
            let classes = 'quiz-option';
            
            if (showResults) {
              if (userAnswer.selectedIndex === optionIndex) {
                classes += ' selected';
                classes += userAnswer.isCorrect ? ' correct' : ' incorrect';
              } else if (optionIndex === question.correct_answer && !userAnswer.isCorrect) {
                classes += ' correct highlight-correct';
              }
            }
            
            return html`
              <div class="${classes}" 
                   @click=${() => showResults ? null : this._handleQuizOptionClick(optionIndex)}>
                <span class="quiz-option-index">${String.fromCharCode(65 + optionIndex)}.</span>
                <span class="quiz-option-text">${option}</span>
                ${showResults && optionIndex === question.correct_answer ? 
                  html`<span class="quiz-option-indicator">✓</span>` : 
                  (showResults && userAnswer.selectedIndex === optionIndex && !userAnswer.isCorrect ? 
                    html`<span class="quiz-option-indicator">✗</span>` : 
                    ''
                  )
                }
              </div>
            `;
          })}
        </div>
        ${showResults ? html`
          <div class="quiz-feedback-message">
            ${userAnswer.isCorrect ? 
              html`<div class="quiz-feedback-correct">Correct! Moving to next question...</div>` : 
              html`<div class="quiz-feedback-incorrect">Not quite right. The correct answer is highlighted.</div>`
            }
          </div>
        ` : ''}
      `;
    } catch (error) {
      console.error('Error rendering quiz question:', error);
      return html`<div class="quiz-error">
        Error rendering quiz question. Please try again later.
        <details>
          <summary>Technical details</summary>
          <pre>${error.message || 'Unknown error'}</pre>
        </details>
      </div>`;
    }
  }

  _renderQuizNavigation() {
    // Don't render navigation buttons as we're auto-advancing
    return html``;
  }

  _renderQuizProgress() {
    try {
      if (!this.quizAnswers || !Array.isArray(this.quizAnswers) || this.quizAnswers.length === 0) {
        return html`<div class="quiz-progress">
          <div class="quiz-progress-item active"></div>
        </div>`;
      }
      
      return html`
        <div class="quiz-progress">
          ${this.quizAnswers.map((answer, index) => {
            let className = 'quiz-progress-item';
            if (index === this.currentQuizIndex) {
              className += ' active';
            }
            if (answer !== null) {
              className += ' answered';
            }
            return html`<div class="${className}"></div>`;
          })}
        </div>
      `;
    } catch (error) {
      console.error('Error rendering quiz progress:', error);
      return html`<div class="quiz-progress">
        <div class="quiz-progress-item active"></div>
      </div>`;
    }
  }

  _renderQuizResults() {
    const score = this._getQuizScore();
    let feedback;
    
    if (score.percentage >= 90) {
      feedback = "Excellent! You've mastered this content!";
    } else if (score.percentage >= 70) {
      feedback = "Good job! You understand most of the material.";
    } else if (score.percentage >= 50) {
      feedback = "You're making progress! Review the story again for better understanding.";
    } else {
      feedback = "Let's try again! Re-read the story to improve your understanding.";
    }
    
    return html`
      <div class="quiz-results">
        <div class="quiz-score">
          ${score.correct} / ${score.total} (${score.percentage}%)
        </div>
        <div class="quiz-feedback">
          ${feedback}
        </div>
        <div class="quiz-actions">
          <button class="quiz-restart-button" @click=${this._handleRestartQuiz}>
            Restart Quiz
          </button>
          <button class="quiz-continue-button" @click=${this._handleContinueStory}>
            Continue Story
          </button>
        </div>
      </div>
    `;
  }

  _handleContinueStory() {
    // Dispatch a custom event that will be handled by the parent
    const event = new CustomEvent('continue-story', {
      bubbles: true,
      composed: true,
      detail: { story: this.story }
    });
    this.dispatchEvent(event);
    
    // Also log for debugging
    console.log('Continue story event dispatched from quiz');
  }

  _renderQuiz() {
    try {
      if (!this.story.quiz || !this.story.quiz.length) {
        return html`<p>No quiz available for this story.</p>`;
      }

      if (this.quizCompleted) {
        return this._renderQuizResults();
      }

      // Ensure currentQuizIndex is within bounds
      if (this.currentQuizIndex < 0 || this.currentQuizIndex >= this.story.quiz.length) {
        this.currentQuizIndex = 0;
      }

      const currentQuestion = this.story.quiz[this.currentQuizIndex];
      
      // Check if currentQuestion is valid
      if (!currentQuestion || typeof currentQuestion !== 'object') {
        console.error('Invalid quiz question at index', this.currentQuizIndex);
        return html`<p>Error: Invalid quiz data. Please try again.</p>`;
      }

      return html`
        ${this._renderQuizProgress()}
        <div class="quiz-item">
          ${this._renderQuizQuestion(currentQuestion, this.currentQuizIndex)}
          ${this._renderQuizNavigation()}
        </div>
      `;
    } catch (error) {
      console.error('Error rendering quiz:', error);
      return html`<p>An error occurred while displaying the quiz: ${error.message}</p>`;
    }
  }

  render() {
    if (!this.story) {
      return html`<div>No story content available</div>`;
    }

    return html`
      <div class="story-content-container">
        ${this.showHeader ? html`
          <header class="story-header">
            <h1 class="story-title">${this.story.title || 'Untitled Story'}</h1>
            <div class="story-meta">
              <div class="story-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${this._formatDate(this.story.created_at)}
              </div>
              <div class="story-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                ${this.story.word_count || '0'} words
              </div>
              <div class="story-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20V10"></path>
                  <path d="M18 20V4"></path>
                  <path d="M6 20v-4"></path>
                </svg>
                Grade ${this.story.academic_grade || 'K-12'}
              </div>
            </div>
          </header>
        ` : ''}
        
        ${this.showSummary && this.story.summary ? html`
          <div class="story-summary">
            <h2 class="summary-title">Story Summary</h2>
            <p class="summary-text">${this.story.summary}</p>
          </div>
        ` : ''}
        
        <div class="story-text">
          ${this.story.content.split('\n\n').map(p => html`
            <p>${p}</p>
          `)}
        </div>
        
        ${this.showVocabulary ? this._renderVocabulary() : ''}
        
        ${this.showQuiz ? this._renderQuiz() : ''}
      </div>
    `;
  }
}

// Register the component
customElements.define('story-content', StoryContent);