import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ContinuationResult extends LitElement {
  static properties = {
    continuationContent: { type: String },
    vocabularyItems: { type: Array }
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

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  constructor() {
    super();
    this.continuationContent = '';
    this.vocabularyItems = [];
  }

  render() {
    if (!this.continuationContent) {
      return html``;
    }

    // Process the text with proper paragraph breaks
    const formattedContinuation = this.continuationContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
      
    return html`
      <div class="continuation-result">
        <h3>Story Continuation</h3>
        <div class="continuation-content">
          <p .innerHTML=${formattedContinuation}></p>
        </div>
        <vocabulary-display .vocabularyItems=${this.vocabularyItems}></vocabulary-display>
      </div>
    `;
  }
}

customElements.define('continuation-result', ContinuationResult); 