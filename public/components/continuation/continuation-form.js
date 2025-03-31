import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ContinuationForm extends LitElement {
  static properties = {
    settings: { type: Object },
    isSubmitting: { type: Boolean },
    hasOriginalStory: { type: Boolean },
    vocabularyItems: { type: Array }
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

    .continuation-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      align-items: center;
      width: 100%;
    }

    h3 {
      color: var(--primary, #5e7ce6);
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      text-align: center;
      width: 100%;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    .input-group label {
      font-weight: 600;
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1rem;
      color: var(--text-secondary, #6c757d);
      text-align: center;
    }

    select {
      padding: 0.75rem;
      border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 8px;
      background-color: var(--bg, #f8f9fa);
      color: var(--text, #212529);
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      font-size: 0.95rem;
      width: 100%;
      text-align: center;
      transition: all 0.2s ease;
    }

    select:focus {
      outline: none;
      border-color: var(--primary, #5e7ce6);
      box-shadow: 0 0 0 3px rgba(94, 124, 230, 0.1);
    }

    .separator {
      width: 80%;
      height: 1px;
      background-color: var(--border, rgba(0, 0, 0, 0.1));
      margin: 0.5rem 0;
    }

    .continue-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background: var(--primary, #5e7ce6);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      min-width: 200px;
    }

    .continue-button:hover {
      background: var(--primary-600, #4a63b9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    }

    .continue-button:disabled {
      background: var(--gray-500, #adb5bd);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
    
    .selector-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 1.5rem;
    }
    
    .mobile-selector-header {
      display: none;
    }

    @media (max-width: 768px) {
      .continuation-form {
        gap: 1rem;
      }
      
      h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
      }
    }
    
    @media (max-width: 500px) {
      .selector-container {
        width: 100%;
        margin-top: 0;
      }
      
      .mobile-selector-header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
      }
      
      .mobile-selector-header h4 {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-secondary, #6c757d);
        text-align: center;
        margin: 0;
      }
      
      .focus-header {
        display: none;
      }
      
      .selectors-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        width: 100%;
      }
      
      .separator {
        display: none;
      }
      
      .input-group {
        margin-bottom: 0.5rem;
      }
      
      .continuation-form {
        gap: 0.75rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.settings = {
      length: '300',
      difficulty: 'same_level',
      focus: 'general'
    };
    this.isSubmitting = false;
    this.hasOriginalStory = false;
    this.vocabularyItems = [];
    console.log('ContinuationForm constructor called');
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('ContinuationForm connected', {
      settings: this.settings,
      hasOriginalStory: this.hasOriginalStory
    });
  }

  updated(changedProperties) {
    if (changedProperties.has('hasOriginalStory')) {
      console.log('ContinuationForm: hasOriginalStory updated to', this.hasOriginalStory);
    }
    if (changedProperties.has('settings')) {
      console.log('ContinuationForm: settings updated to', this.settings);
    }
    if (changedProperties.has('vocabularyItems')) {
      console.log('ContinuationForm: vocabularyItems updated:', this.vocabularyItems);
    }
  }

  _handleInputChange(e) {
    const { name, value } = e.target;
    this.settings = {
      ...this.settings,
      [name]: value
    };
    
    // Dispatch event for parent component
    this.dispatchEvent(new CustomEvent('settings-change', {
      detail: { settings: this.settings },
      bubbles: true,
      composed: true
    }));
  }

  _handleDifficultyChange(e) {
    const { difficulty } = e.detail;
    this.settings = {
      ...this.settings,
      difficulty
    };
    
    // Dispatch event for parent component
    this.dispatchEvent(new CustomEvent('settings-change', {
      detail: { settings: this.settings },
      bubbles: true,
      composed: true
    }));
  }

  _handleFocusChange(e) {
    const { focus } = e.detail;
    this.settings = {
      ...this.settings,
      focus
    };
    
    // Dispatch event for parent component
    this.dispatchEvent(new CustomEvent('settings-change', {
      detail: { settings: this.settings },
      bubbles: true,
      composed: true
    }));
  }

  _handleContinue() {
    this.dispatchEvent(new CustomEvent('continue-requested', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="continuation-form">
        <h3>Continue the Story</h3>
        
        <div class="input-group">
          <label for="length">Length</label>
          <select 
            id="length" 
            name="length" 
            @change="${this._handleInputChange}"
            ?disabled="${this.isSubmitting}"
          >
            <option value="200" ?selected=${this.settings.length === '200'}>Short (200 words)</option>
            <option value="300" ?selected=${this.settings.length === '300'}>Medium (300 words)</option>
            <option value="500" ?selected=${this.settings.length === '500'}>Long (500 words)</option>
          </select>
        </div>
        
        <div class="mobile-selector-header">
          <h4>Difficulty Level</h4>
          <h4>Story Focus</h4>
        </div>
        
        <div class="selector-container">
          <div class="selectors-grid">
            <difficulty-selector 
              .difficulty=${this.settings.difficulty}
              ?disabled=${this.isSubmitting}
              @difficulty-change=${this._handleDifficultyChange}
            ></difficulty-selector>
            
            <focus-selector
              .focus=${this.settings.focus}
              .vocabularyItems=${this.vocabularyItems}
              ?disabled=${this.isSubmitting}
              @focus-change=${this._handleFocusChange}
            ></focus-selector>
          </div>
        </div>
        
        <button 
          class="continue-button ${this.isSubmitting ? 'loading' : ''}" 
          @click="${this._handleContinue}"
          ?disabled="${this.isSubmitting || !this.hasOriginalStory}"
        >
          ${this.isSubmitting ? 
            html`<div class="spinner"></div> Generating...` : 
            'Continue Story'
          }
        </button>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('continuation-form')) {
  customElements.define('continuation-form', ContinuationForm);
} 