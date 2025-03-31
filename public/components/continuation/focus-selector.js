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
      width: 190px;
      height: 90px;
      margin: 0 5px;
      justify-content: center;
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
      width: 100%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.2;
      height: 2.4em;
    }
    
    /* Text size adjustments for label length */
    .focus-label.long-text {
      font-size: 0.75rem;
    }
    
    .focus-label.very-long-text {
      font-size: 0.65rem;
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
        width: 160px;
        height: 80px;
        margin-bottom: 10px;
      }
      
      .focus-icon {
        font-size: 1.3rem;
      }
      
      .focus-label {
        font-size: 0.7rem;
      }
      
      .focus-label.long-text {
        font-size: 0.65rem;
      }
      
      .focus-label.very-long-text {
        font-size: 0.6rem;
      }
    }

    @media (max-width: 500px) {
      .focus-options {
        gap: 0.5rem;
        width: 100%;
      }
      
      .focus-options label {
        display: none;
      }
      
      .focus-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        width: 100%;
      }
      
      .focus-button {
        width: 100%;
        height: 36px;
        padding: 0.5rem 0.25rem;
        margin: 0;
        border-radius: 8px;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 0.5rem;
      }
      
      .focus-icon {
        font-size: 1.2rem;
        margin-bottom: 0;
        margin-left: 0.25rem;
      }
      
      .focus-label {
        font-size: 0.7rem;
        text-align: left;
        white-space: nowrap;
        -webkit-line-clamp: 1;
        height: auto;
      }
      
      .focus-label.long-text {
        font-size: 0.65rem;
      }
      
      .focus-label.very-long-text {
        font-size: 0.55rem;
      }
      
      /* Make the general focus button stand out */
      .focus-button:nth-child(3) {
        background-color: var(--primary-50, #eef2ff);
        border-color: var(--primary-200, #c5d1ff);
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
    
    // Helper function to determine text length class
    const getTextLengthClass = (text) => {
      if (!text) return '';
      if (text.length > 30) return 'very-long-text';
      if (text.length > 20) return 'long-text';
      return '';
    };
    
    // Create buttons for top vocabulary items if available
    let vocabButtons = [];
    if (hasVocabItems) {
      vocabButtons = this.topVocabularyItems.map(item => {
        const textLengthClass = getTextLengthClass(item.term);
        return html`
          <button 
            class="focus-button ${this.focus === item.term ? 'active' : ''}" 
            @click="${() => this._handleFocusChange(item.term)}"
            ?disabled="${this.disabled}"
            title="${item.definition || item.term}"
          >
            <span class="focus-icon">📚</span>
            <span class="focus-label ${textLengthClass}">${item.term}</span>
          </button>
        `;
      });
    }
    
    // Create the general button
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
    
    // Create the final array of buttons with general button in the third position
    let allButtons = [];
    
    if (vocabButtons.length >= 2) {
      // If we have at least 2 vocabulary items, put them before the general button
      allButtons.push(vocabButtons[0]);
      allButtons.push(vocabButtons[1]);
      allButtons.push(generalButton); // General button at position 3
      
      // Add any remaining vocab buttons
      for (let i = 2; i < vocabButtons.length; i++) {
        allButtons.push(vocabButtons[i]);
      }
    } else if (vocabButtons.length === 1) {
      // If we have only 1 vocabulary item, add placeholder buttons
      allButtons.push(vocabButtons[0]);
      
      // Add empty placeholder button
      allButtons.push(html`
        <button class="focus-button" disabled style="opacity: 0.5; cursor: not-allowed;">
          <span class="focus-icon">📚</span>
          <span class="focus-label">No more terms</span>
        </button>
      `);
      
      allButtons.push(generalButton); // General button at position 3
    } else {
      // If no vocab buttons, general button still at position 3 with placeholders
      allButtons.push(html`
        <button class="focus-button" disabled style="opacity: 0.5; cursor: not-allowed;">
          <span class="focus-icon">📚</span>
          <span class="focus-label">Generate story first</span>
        </button>
      `);
      
      allButtons.push(html`
        <button class="focus-button" disabled style="opacity: 0.5; cursor: not-allowed;">
          <span class="focus-icon">📚</span>
          <span class="focus-label">No terms yet</span>
        </button>
      `);
      
      allButtons.push(generalButton); // General button at position 3
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