import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class QuizOption extends LitElement {
  static get properties() {
    return {
      option: { type: String },
      index: { type: Number },
      isSelected: { type: Boolean },
      isCorrect: { type: Boolean },
      isIncorrect: { type: Boolean },
      disabled: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .option {
        position: relative;
        padding: 1rem;
        background: var(--bg, #f8f9fa);
        border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .option:hover {
        background: var(--bg-hover, #e9ecef);
        transform: translateY(-1px);
      }

      .option.disabled {
        cursor: default;
      }

      .option.disabled:hover {
        transform: none;
        background: var(--bg, #f8f9fa);
      }

      .option.selected {
        border-color: var(--primary, #5e7ce6);
        background: var(--primary-50, #eef2ff);
      }

      .option.correct {
        border-color: var(--success, #38b2ac);
        background: rgba(56, 178, 172, 0.1);
      }

      .option.incorrect {
        border-color: var(--error, #f56565);
        background: rgba(245, 101, 101, 0.1);
      }

      .option-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .option-marker {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--text, #212529);
        background: white;
        flex-shrink: 0;
      }

      .option.selected .option-marker {
        background: var(--primary, #5e7ce6);
        color: white;
        border-color: var(--primary, #5e7ce6);
      }

      .option.correct .option-marker {
        background: var(--success, #38b2ac);
        color: white;
        border-color: var(--success, #38b2ac);
      }

      .option.incorrect .option-marker {
        background: var(--error, #f56565);
        color: white;
        border-color: var(--error, #f56565);
      }

      .option-text {
        font-size: 1rem;
        color: var(--text, #212529);
        line-height: 1.5;
      }
    `;
  }

  constructor() {
    super();
    this.option = '';
    this.index = 0;
    this.isSelected = false;
    this.isCorrect = false;
    this.isIncorrect = false;
    this.disabled = false;
  }

  _handleClick() {
    if (this.disabled) return;
    
    this.dispatchEvent(new CustomEvent('option-selected', {
      detail: { index: this.index },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const optionClasses = {
      'option': true,
      'selected': this.isSelected,
      'correct': this.isCorrect,
      'incorrect': this.isIncorrect,
      'disabled': this.disabled
    };

    const classString = Object.entries(optionClasses)
      .filter(([, isActive]) => isActive)
      .map(([className]) => className)
      .join(' ');

    return html`
      <div class="${classString}" @click=${this._handleClick}>
        <div class="option-content">
          <div class="option-marker">${String.fromCharCode(65 + this.index)}</div>
          <div class="option-text">${this.option}</div>
        </div>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('quiz-option')) {
  customElements.define('quiz-option', QuizOption);
} 