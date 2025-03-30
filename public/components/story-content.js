import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class StoryContent extends LitElement {
  static get properties() {
    return {
      story: { type: Object },
      showHeader: { type: Boolean },
      showSummary: { type: Boolean },
      showVocabulary: { type: Boolean },
      showQuiz: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.story = null;
    this.showHeader = true;
    this.showSummary = true;
    this.showVocabulary = true;
    this.showQuiz = true;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      }

      .story-content-container {
        background: var(--card-bg, white);
        border-radius: 24px;
        padding: 3rem;
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        margin-bottom: 2rem;
      }

      .story-header {
        margin-bottom: 2rem;
      }

      .story-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 800;
        font-size: 2.5rem;
        color: var(--text, #212529);
        line-height: 1.2;
        margin: 0 0 1rem;
      }

      .story-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
      }

      .story-meta-item {
        font-size: 0.875rem;
        color: var(--text-secondary, #6c757d);
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .story-summary {
        padding: 1.5rem;
        background: var(--bg, #f8f9fa);
        border-radius: 12px;
        margin-bottom: 2rem;
      }

      .summary-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--primary, #5e7ce6);
        margin: 0 0 0.75rem;
      }

      .summary-text {
        color: var(--text, #212529);
        line-height: 1.6;
        margin: 0;
      }

      .story-text {
        font-size: 1.125rem;
        line-height: 1.8;
        color: var(--text, #212529);
      }

      .story-text p {
        margin-bottom: 1.5rem;
      }

      .story-vocabulary, .story-quiz {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }

      .vocabulary-title, .quiz-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 700;
        font-size: 1.5rem;
        color: var(--text, #212529);
        margin: 0 0 1.5rem;
      }

      .vocabulary-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .vocabulary-item {
        background: var(--bg, #f8f9fa);
        border-radius: 8px;
        padding: 1rem;
        border-left: 3px solid var(--primary, #5e7ce6);
      }

      .vocabulary-term {
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--primary, #5e7ce6);
        margin: 0 0 0.5rem;
      }

      .vocabulary-definition {
        font-size: 0.9375rem;
        color: var(--text, #212529);
        line-height: 1.5;
        margin: 0;
      }

      .quiz-list {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .quiz-item {
        background: var(--bg, #f8f9fa);
        border-radius: 12px;
        padding: 1.5rem;
      }

      .quiz-question {
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--text, #212529);
        margin: 0 0 1rem;
      }

      .quiz-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .quiz-option {
        display: flex;
        align-items: flex-start;
        padding: 0.75rem;
        background: white;
        border-radius: 8px;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .quiz-option:hover {
        background: var(--primary-50, #eef2ff);
      }

      .quiz-option.selected {
        background: var(--primary-100, #dbeafe);
        border-color: var(--primary, #5e7ce6);
      }

      .quiz-option.correct {
        background: var(--success-100, #dcfce7);
        border-color: var(--success, #22c55e);
      }

      .quiz-option.incorrect {
        background: var(--danger-100, #fee2e2);
        border-color: var(--danger, #ef4444);
      }

      .quiz-option-text {
        margin-left: 0.5rem;
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

  _renderQuiz() {
    if (!this.story.quiz || !this.story.quiz.length) {
      return html`<p>No quiz available for this story.</p>`;
    }

    return html`
      <div class="quiz-list">
        ${this.story.quiz.map((item, questionIndex) => html`
          <div class="quiz-item">
            <div class="quiz-question">${questionIndex + 1}. ${item.question}</div>
            <div class="quiz-options">
              ${item.options.map((option, optionIndex) => html`
                <div class="quiz-option" 
                     @click=${() => this._handleQuizOptionClick(questionIndex, optionIndex)}
                     data-correct=${optionIndex === item.correct_answer}>
                  <span class="quiz-option-index">${String.fromCharCode(65 + optionIndex)}.</span>
                  <span class="quiz-option-text">${option}</span>
                </div>
              `)}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _handleQuizOptionClick(questionIndex, optionIndex) {
    const quizItem = this.story.quiz[questionIndex];
    const isCorrect = optionIndex === quizItem.correct_answer;
    
    // Get all options for this question
    const options = this.shadowRoot.querySelectorAll(`.quiz-item:nth-child(${questionIndex + 1}) .quiz-option`);
    
    // Reset all options
    options.forEach(option => {
      option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Mark the clicked option
    const clickedOption = options[optionIndex];
    clickedOption.classList.add('selected');
    
    if (isCorrect) {
      clickedOption.classList.add('correct');
    } else {
      clickedOption.classList.add('incorrect');
      // Also highlight the correct answer
      options[quizItem.correct_answer].classList.add('correct');
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
          ${this.story.content.split('\n\n').map(p => html`<p>${p}</p>`)}
        </div>
        
        ${this.showVocabulary && this.story.vocabulary ? html`
          <div class="story-vocabulary">
            <h2 class="vocabulary-title">Vocabulary</h2>
            ${this._renderVocabulary()}
          </div>
        ` : ''}
        
        ${this.showQuiz && this.story.quiz ? html`
          <div class="story-quiz">
            <h2 class="quiz-title">Comprehension Quiz</h2>
            ${this._renderQuiz()}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('story-content', StoryContent); 