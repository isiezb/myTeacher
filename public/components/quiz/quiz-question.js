import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import '/components/quiz/quiz-option.js';

export class QuizQuestion extends LitElement {
  static get properties() {
    return {
      question: { type: Object },
      index: { type: Number },
      selectedOption: { type: Number },
      showResults: { type: Boolean },
      showFeedback: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .question {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        animation: fadeIn 0.4s ease-in-out;
      }

      .question:last-child {
        border-bottom: none;
        margin-bottom: 1rem;
      }

      .question-text {
        font-weight: 600;
        font-size: 1.125rem;
        margin-bottom: 1rem;
        color: var(--text, #212529);
        line-height: 1.5;
      }

      .options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .question-feedback {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
        font-size: 0.95rem;
        line-height: 1.5;
        color: var(--text-secondary, #6c757d);
        background: var(--bg, #f8f9fa);
        border-left: 4px solid var(--info, #4299e1);
        animation: fadeIn 0.4s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  constructor() {
    super();
    this.question = {};
    this.index = 0;
    this.selectedOption = undefined;
    this.showResults = false;
    this.showFeedback = false;
  }

  _handleOptionSelect(e) {
    if (this.showResults) return;
    
    const selectedIndex = e.detail.index;
    
    this.dispatchEvent(new CustomEvent('option-selected', {
      detail: {
        questionIndex: this.index,
        optionIndex: selectedIndex
      },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.question) return html``;

    const { question, options, correctAnswer, feedback } = this.question;
    const isAnswered = this.selectedOption !== undefined;
    const shouldShowFeedback = this.showFeedback && isAnswered && feedback;
    
    return html`
      <div class="question">
        <div class="question-text">${this.index + 1}. ${question}</div>
        
        <div class="options">
          ${options.map((option, optionIndex) => {
            const isSelected = this.selectedOption === optionIndex;
            const isCorrect = this.showResults && correctAnswer === optionIndex;
            const isIncorrect = this.showResults && isSelected && !isCorrect;
            
            return html`
              <quiz-option
                .option=${option}
                .index=${optionIndex}
                ?isSelected=${isSelected}
                ?isCorrect=${isCorrect}
                ?isIncorrect=${isIncorrect}
                ?disabled=${this.showResults}
                @option-selected=${this._handleOptionSelect}
              ></quiz-option>
            `;
          })}
        </div>
        
        ${shouldShowFeedback ? html`
          <div class="question-feedback">
            ${feedback}
          </div>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('quiz-question')) {
  customElements.define('quiz-question', QuizQuestion);
} 