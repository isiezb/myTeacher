import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class VocabularyDisplay extends LitElement {
  static properties = {
    vocabularyItems: { type: Array }
  };

  static styles = css`
    .vocabulary-section {
      margin-top: 2rem;
      background-color: #f9f9f9;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #4285f4;
    }
    
    .vocabulary-section h3 {
      color: #333;
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.25rem;
      font-family: var(--font-heading, 'Inter', sans-serif);
      text-align: center;
    }
    
    .vocabulary-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .vocabulary-item {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: transform 0.2s ease;
    }
    
    .vocabulary-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .vocabulary-term {
      color: #4285f4;
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-family: var(--font-heading, 'Inter', sans-serif);
    }
    
    .vocabulary-definition {
      color: #555;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.4;
      font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
    }
  `;

  constructor() {
    super();
    this.vocabularyItems = [];
  }

  render() {
    if (!this.vocabularyItems || this.vocabularyItems.length === 0) {
      return html``;
    }

    return html`
      <div class="vocabulary-section">
        <h3>New Vocabulary</h3>
        <div class="vocabulary-list">
          ${this.vocabularyItems.map(item => html`
            <div class="vocabulary-item">
              <h4 class="vocabulary-term">${item.term}</h4>
              <p class="vocabulary-definition">${item.definition}</p>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('vocabulary-display')) {
  customElements.define('vocabulary-display', VocabularyDisplay);
} 