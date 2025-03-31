import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class DifficultySelector extends LitElement {
  static properties = {
    difficulty: { type: String },
    disabled: { type: Boolean }
  };

  static styles = css`
    .difficulty-options {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
    
    .difficulty-options label {
      font-weight: 600;
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1rem;
      color: var(--text-secondary, #6c757d);
    }
    
    .difficulty-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
    }
    
    .difficulty-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 12px;
      background-color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 110px;
    }
    
    .difficulty-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .difficulty-button.active {
      border-color: var(--primary, #5e7ce6);
      background-color: var(--primary-50, #eef2ff);
    }
    
    .difficulty-emoji {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .difficulty-label {
      font-size: 0.8rem;
      text-align: center;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .difficulty-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .difficulty-button {
        width: 80%;
        flex-direction: row;
        justify-content: flex-start;
        gap: 1rem;
      }
      
      .difficulty-emoji {
        margin-bottom: 0;
      }
    }
  `;

  constructor() {
    super();
    this.difficulty = 'same_level';
    this.disabled = false;
  }

  _handleDifficultyChange(difficulty) {
    this.difficulty = difficulty;
    this.dispatchEvent(new CustomEvent('difficulty-change', {
      detail: { difficulty },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="difficulty-options">
        <label>Difficulty Level</label>
        <div class="difficulty-buttons">
          <button 
            class="difficulty-button ${this.difficulty === 'much_easier' ? 'active' : ''}" 
            @click="${() => this._handleDifficultyChange('much_easier')}"
            ?disabled="${this.disabled}"
          >
            <span class="difficulty-emoji">😌</span>
            <span class="difficulty-label">Much Easier</span>
          </button>
          <button 
            class="difficulty-button ${this.difficulty === 'slightly_easier' ? 'active' : ''}" 
            @click="${() => this._handleDifficultyChange('slightly_easier')}"
            ?disabled="${this.disabled}"
          >
            <span class="difficulty-emoji">😊</span>
            <span class="difficulty-label">Slightly Easier</span>
          </button>
          <button 
            class="difficulty-button ${this.difficulty === 'same_level' ? 'active' : ''}" 
            @click="${() => this._handleDifficultyChange('same_level')}"
            ?disabled="${this.disabled}"
          >
            <span class="difficulty-emoji">😐</span>
            <span class="difficulty-label">Same Level</span>
          </button>
          <button 
            class="difficulty-button ${this.difficulty === 'slightly_harder' ? 'active' : ''}" 
            @click="${() => this._handleDifficultyChange('slightly_harder')}"
            ?disabled="${this.disabled}"
          >
            <span class="difficulty-emoji">🤔</span>
            <span class="difficulty-label">Slightly Harder</span>
          </button>
          <button 
            class="difficulty-button ${this.difficulty === 'much_harder' ? 'active' : ''}" 
            @click="${() => this._handleDifficultyChange('much_harder')}"
            ?disabled="${this.disabled}"
          >
            <span class="difficulty-emoji">🧠</span>
            <span class="difficulty-label">Much Harder</span>
          </button>
        </div>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('difficulty-selector')) {
  customElements.define('difficulty-selector', DifficultySelector);
} 