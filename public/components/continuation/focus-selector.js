import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class FocusSelector extends LitElement {
  static properties = {
    vocabularyItems: { type: Array },
    focus: { type: String },
    disabled: { type: Boolean }
  };

  static styles = css`
    .focus-options {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      margin: 0 auto;
      max-width: 700px;
    }
    
    .focus-options label {
      font-weight: 600;
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1rem;
      color: var(--text-secondary, #6c757d);
      text-align: center;
    }
    
    .focus-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      margin: 0 auto;
    }
    
    .focus-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem;
      border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
      border-radius: 12px;
      background-color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 130px;
      margin: 0 5px;
    }
    
    .focus-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .focus-button.active {
      border-color: var(--primary, #5e7ce6);
      background-color: var(--primary-50, #eef2ff);
    }
    
    .focus-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .focus-label {
      font-size: 0.8rem;
      text-align: center;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
    
    .general-focus {
      font-weight: 600;
      color: var(--primary, #5e7ce6);
    }

    @media (max-width: 768px) {
      .focus-buttons {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 500px;
      }
      
      .focus-button {
        width: 120px;
        margin-bottom: 10px;
      }
    }

    @media (max-width: 500px) {
      .focus-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .focus-button {
        width: 80%;
        flex-direction: row;
        justify-content: flex-start;
        gap: 1rem;
      }
      
      .focus-icon {
        margin-bottom: 0;
      }
    }
  `;

  constructor() {
    super();
    this.vocabularyItems = [];
    this.focus = 'general';
    this.disabled = false;
    this.topVocabularyItems = [];
    console.log('FocusSelector constructor called');
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('FocusSelector connected', {focus: this.focus});
  }

  updated(changedProperties) {
    if (changedProperties.has('vocabularyItems') && this.vocabularyItems) {
      console.log('FocusSelector updated() called with vocabulary items:', 
        JSON.stringify(this.vocabularyItems.map(v => ({
          term: v.term,
          importance: v.importance
        }))));
      
      // Get top 4 vocabulary items by importance
      this.topVocabularyItems = [...this.vocabularyItems]
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 4);
      
      console.log('Top vocabulary items updated:', 
        JSON.stringify(this.topVocabularyItems.map(v => ({
          term: v.term, 
          importance: v.importance
        }))));
      
      this.requestUpdate();
    }
  }

  _handleFocusChange(newFocus) {
    console.log('FocusSelector: focus changed to', newFocus);
    this.focus = newFocus;
    this.dispatchEvent(new CustomEvent('focus-change', {
      detail: { focus: newFocus },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    console.log('FocusSelector render called with focus:', this.focus);
    console.log('Vocabulary items:', this.vocabularyItems);
    
    // Check if we have vocabulary items
    const hasVocabItems = this.vocabularyItems && this.vocabularyItems.length > 0;
    
    // Create buttons for top vocabulary items if available
    let vocabButtons = [];
    if (hasVocabItems) {
      vocabButtons = this.topVocabularyItems.map(item => {
        return html`
          <button 
            class="focus-button ${this.focus === item.term ? 'active' : ''}" 
            @click="${() => this._handleFocusChange(item.term)}"
            ?disabled="${this.disabled}"
            title="${item.definition}"
          >
            <span class="focus-icon">📚</span>
            <span class="focus-label">${item.term}</span>
          </button>
        `;
      });
    }
    
    // Always add the general button, prominently
    const generalButton = html`
      <button 
        class="focus-button ${this.focus === 'general' ? 'active' : ''}" 
        @click="${() => this._handleFocusChange('general')}"
        ?disabled="${this.disabled}"
      >
        <span class="focus-icon">🌟</span>
        <span class="focus-label general-focus">Keep it general</span>
      </button>
    `;
    
    // Create the final array of buttons with general button first
    let allButtons = [generalButton];
    
    // Add vocabulary buttons if we have any
    if (vocabButtons.length > 0) {
      allButtons = allButtons.concat(vocabButtons);
    } else {
      // If no vocab buttons, add a placeholder message
      console.log('No vocabulary items available for focus selector');
    }

    return html`
      <div class="focus-options">
        <label>Story Focus</label>
        <div class="focus-buttons">
          ${allButtons}
        </div>
        ${!hasVocabItems ? html`
          <div style="font-size: 0.85rem; color: var(--text-secondary, #6c757d); margin-top: 0.5rem;">
            Vocabulary terms will appear here after generating the first story
          </div>
        ` : ''}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('focus-selector')) {
  customElements.define('focus-selector', FocusSelector);
} 