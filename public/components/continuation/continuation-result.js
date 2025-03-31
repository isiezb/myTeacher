import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import '../story/story-quiz.js';

export class ContinuationResult extends LitElement {
  static properties = {
    continuationContent: { type: String },
    vocabularyItems: { type: Array },
    summary: { type: String },
    quiz: { type: Array },
    difficulty: { type: String },
    title: { type: String },
    subject: { type: String },
    gradeLevel: { type: String },
    wordCount: { type: Number },
    focus: { type: String }
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
      margin-bottom: 0.5rem;
      font-weight: 700;
      text-align: center;
    }
    
    .story-metadata {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: var(--text-secondary, #6c757d);
      font-size: 0.9rem;
      text-align: center;
    }
    
    .metadata-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .metadata-item-icon {
      opacity: 0.7;
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
      padding: 0.85rem 1.75rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
      background: var(--primary, #5e7ce6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .continue-button:hover {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.15));
    }
    
    .continue-button-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }
    
    .continue-message {
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.1rem;
      color: var(--text, #212529);
      margin-bottom: 1rem;
      font-weight: 600;
      text-align: center;
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
    this.title = 'Story Continuation';
    this.subject = 'General';
    this.gradeLevel = 'Not specified';
    this.wordCount = 0;
    this.focus = 'general';
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('ContinuationResult connected with quiz data:', this.quiz);
  }

  updated(changedProperties) {
    if (changedProperties.has('quiz')) {
      console.log('ContinuationResult quiz property updated:', {
        quiz: this.quiz,
        hasQuiz: !!this.quiz && Array.isArray(this.quiz) && this.quiz.length > 0,
        quizLength: this.quiz ? this.quiz.length : 0
      });
    }
  }

  firstUpdated() {
    // After the component is first rendered, scroll to the first paragraph of the content
    this._scrollToContent();
  }

  _scrollToContent() {
    setTimeout(() => {
      console.log('Attempting to scroll to continuation content');
      const continuationContent = this.shadowRoot.querySelector('.continuation-content');
      if (continuationContent) {
        const firstParagraph = continuationContent.querySelector('p');
        if (firstParagraph) {
          // Calculate position with header clearance
          const headerHeight = 80; // Adjust if needed
          
          // Get the position of the element relative to the top of the document
          const elementPosition = firstParagraph.getBoundingClientRect().top + window.pageYOffset;
          
          // Position the element exactly at the top of the viewport, with just header clearance
          const offsetPosition = elementPosition - headerHeight;
          
          console.log('Scrolling continuation content to position:', offsetPosition);
          
          // Scroll to beginning of continuation content - use auto for more reliability
          window.scrollTo({
            top: offsetPosition,
            behavior: 'auto'
          });
          
          // Highlight the first paragraph briefly
          firstParagraph.classList.add('highlight-new-content');
          setTimeout(() => {
            firstParagraph.classList.remove('highlight-new-content');
          }, 2000);
        } else {
          console.warn('No paragraph found in continuation content');
          
          // Fallback - scroll to the continuation result container
          const resultContainer = this.shadowRoot.querySelector('.continuation-result');
          if (resultContainer) {
            const position = resultContainer.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({
              top: position,
              behavior: 'auto'
            });
          }
        }
      } else {
        console.warn('No continuation content container found');
      }
    }, 50); // Short delay to ensure render is complete
  }

  _handleContinueStory() {
    // Create a new story object that combines the original story and the continuation
    const continuedStory = {
      id: `continued-${Date.now()}`,
      content: this.continuationContent,
      summary: this.summary,
      vocabulary: this.vocabularyItems,
      quiz: this.quiz,
      difficulty: this.difficulty,
      title: this.title,
      subject: this.subject,
      grade_level: this.gradeLevel,
      word_count: this.wordCount,
      focus: this.focus
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

    // Debug: Check quiz data at render time
    console.log('ContinuationResult render: quiz data check', {
      quiz: this.quiz,
      quizType: typeof this.quiz,
      isArray: Array.isArray(this.quiz),
      quizLength: this.quiz && Array.isArray(this.quiz) ? this.quiz.length : 0,
      quizItems: this.quiz && Array.isArray(this.quiz) ? JSON.stringify(this.quiz) : 'No quiz items',
      vocabularyItems: this.vocabularyItems,
      vocabularyLength: this.vocabularyItems && Array.isArray(this.vocabularyItems) ? this.vocabularyItems.length : 0
    });

    // Process the text with proper paragraph breaks
    const formattedContinuation = this.continuationContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
      
    return html`
      <div class="continuation-result">
        <h3>${this.title}</h3>
        <div class="story-metadata">
          ${this.subject ? html`<div class="metadata-item"><span class="metadata-item-icon">🏷️</span>${this.subject}</div>` : ''}
          ${this.gradeLevel ? html`<div class="metadata-item"><span class="metadata-item-icon">🎓</span>${this.gradeLevel}</div>` : ''}
          ${this.wordCount ? html`<div class="metadata-item"><span class="metadata-item-icon">📄</span>${this.wordCount} words</div>` : ''}
          ${this.focus ? html`<div class="metadata-item"><span class="metadata-item-icon">🔍</span>${this.focus}</div>` : ''}
        </div>
        <div class="continuation-content">
          <p .innerHTML=${formattedContinuation}></p>
        </div>
        
        ${this.summary ? html`
          <div class="summary-section">
            <h4>Summary</h4>
            <div class="summary-content">${this.summary}</div>
          </div>
        ` : ''}
        
        ${this.vocabularyItems && Array.isArray(this.vocabularyItems) && this.vocabularyItems.length > 0 ? html`
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
        
        ${this.quiz && Array.isArray(this.quiz) && this.quiz.length > 0 ? html`
          <div class="quiz-section">
            <h4>Quiz</h4>
            <story-quiz .quiz=${this.quiz}></story-quiz>
          </div>
        ` : ''}
        
        <div class="continue-button-container">
          <div class="continue-message">
            Ready to continue your learning journey?
          </div>
          <button class="continue-button" @click=${this._handleContinueStory}>
            Continue Learning
          </button>
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('continuation-result')) {
  customElements.define('continuation-result', ContinuationResult);
} 