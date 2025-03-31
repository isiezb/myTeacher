import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class StoryVocabulary extends LitElement {
  static properties = {
    vocabulary: { type: Array }
  };

  static styles = css`
    .story-vocabulary {
      margin-top: 2rem;
      margin-bottom: 3.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
    }

    .vocabulary-title {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: var(--text, #212529);
      font-weight: 600;
    }

    .vocabulary-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .vocabulary-item {
      background: var(--secondary-50, #f8f9fa);
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .vocabulary-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .vocabulary-term {
      font-weight: 600;
      color: var(--primary, #5e7ce6);
      margin-bottom: 0.5rem;
    }

    .vocabulary-definition {
      color: var(--text, #212529);
      font-size: 0.9375rem;
      line-height: 1.5;
    }

    .empty-vocabulary {
      padding: 1rem;
      text-align: center;
      color: var(--text-secondary, #6c757d);
      font-style: italic;
    }
  `;

  constructor() {
    super();
    this.vocabulary = [];
  }

  render() {
    if (!this.vocabulary || this.vocabulary.length === 0) {
      return html``;
    }

    return html`
      <div class="story-vocabulary">
        <h3 class="vocabulary-title">Vocabulary</h3>
        <div class="vocabulary-list">
          ${this.vocabulary.map(item => html`
            <div class="vocabulary-item">
              <div class="vocabulary-term">${item.term}</div>
              <div class="vocabulary-definition">${item.definition}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

customElements.define('story-vocabulary', StoryVocabulary);