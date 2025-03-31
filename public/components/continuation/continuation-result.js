import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ContinuationResult extends LitElement {
  static properties = {
    continuationContent: { type: String },
    vocabularyItems: { type: Array },
    summary: { type: String },
    quiz: { type: Array },
    difficulty: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .continuation-result {
      background-color: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      animation: fadeIn 0.5s ease-in-out;
    }

    h3 {
      color: var(--primary, #5e7ce6);
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      text-align: center;
    }

    .continuation-content {
      line-height: 1.7;
      color: var(--text, #212529);
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
    }

    .continuation-content p {
      margin-bottom: 1rem;
    }

    .summary-section,
    .vocabulary-section,
    .quiz-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }

    .summary-section h4,
    .vocabulary-section h4,
    .quiz-section h4 {
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.25rem;
      color: var(--text, #212529);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .summary-content {
      background-color: var(--bg, #f8f9fa);
      padding: 1rem;
      border-radius: 8px;
      font-style: italic;
      color: var(--text-secondary, #6c757d);
      line-height: 1.6;
    }

    .vocabulary-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .vocabulary-item {
      background-color: var(--bg, #f8f9fa);
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid var(--primary, #5e7ce6);
    }

    .vocabulary-term {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text, #212529);
    }

    .vocabulary-definition {
      color: var(--text-secondary, #6c757d);
      font-size: 0.95rem;
      line-height: 1.5;
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

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  constructor() {
    super();
    this.continuationContent = '';
    this.vocabularyItems = [];
    this.summary = '';
    this.quiz = [];
    this.difficulty = 'same_level';
    console.log('ContinuationResult constructor called');
  }

  updated(changedProperties) {
    if (changedProperties.has('summary')) {
      console.log('ContinuationResult summary updated:', this.summary);
    }
    if (changedProperties.has('continuationContent')) {
      console.log('ContinuationResult content updated, length:', this.continuationContent?.length || 0);
    }
    if (changedProperties.has('vocabularyItems')) {
      console.log('ContinuationResult vocabulary updated, count:', this.vocabularyItems?.length || 0);
    }
    if (changedProperties.has('quiz')) {
      console.log('ContinuationResult quiz updated, count:', this.quiz?.length || 0);
    }
  }

  _handleContinueStory() {
    // Create a new story object that combines the original story and the continuation
    const continuedStory = {
      id: `continued-${Date.now()}`,
      content: this.continuationContent,
      summary: this.summary,
      vocabulary: this.vocabularyItems,
      quiz: this.quiz,
      difficulty: this.difficulty
    };
    
    console.log('Continue button clicked in continuation-result, dispatching event with:', continuedStory);
    
    // Dispatch the continue-story event with the continued story
    this.dispatchEvent(new CustomEvent('continue-story', {
      detail: { story: continuedStory },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.continuationContent) {
      return html``;
    }

    // Process the text with proper paragraph breaks
    const formattedContinuation = this.continuationContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
      
    // Create a story object to pass to the story-utilities component
    const storyData = {
      content: this.continuationContent,
      summary: this.summary,
      vocabulary: this.vocabularyItems,
      quiz: this.quiz
    };
      
    return html`
      <div class="continuation-result">
        <h3>Story Continuation</h3>
        <div class="continuation-content">
          <p .innerHTML=${formattedContinuation}></p>
        </div>
        
        ${this.summary ? html`
          <div class="summary-section">
            <h4>Summary</h4>
            <div class="summary-content">${this.summary}</div>
          </div>
        ` : ''}
        
        ${this.vocabularyItems && this.vocabularyItems.length > 0 ? html`
          <div class="vocabulary-section">
            <h4>Vocabulary</h4>
            <div class="vocabulary-list">
              ${this.vocabularyItems.map(item => html`
                <div class="vocabulary-item">
                  <div class="vocabulary-term">${item.term}</div>
                  <div class="vocabulary-definition">${item.definition}</div>
                </div>
              `)}
            </div>
          </div>
        ` : ''}
        
        ${this.quiz && this.quiz.length > 0 ? html`
          <div class="quiz-section">
            <h4>Quiz</h4>
            <story-quiz .quiz=${this.quiz}></story-quiz>
          </div>
        ` : ''}
        
        <story-utilities .story=${storyData}></story-utilities>
        
        <button class="continue-button" @click=${this._handleContinueStory}>
          Continue Story
        </button>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('continuation-result')) {
  customElements.define('continuation-result', ContinuationResult);
} 