import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js';

export class LessonVocabulary extends LitElement {
  static properties = {
    vocabulary: { type: Array }, // Expects an array like [{ term: '...', definition: '...' }, ...]
  };

  static styles = css`
    :host {
      display: block;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      margin-bottom: 0.8rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid #f0f0f0;
    }
    li:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    strong {
      font-weight: 600;
      color: var(--primary-color, #4a63b9);
      margin-right: 0.5em;
    }
    .definition {
      font-size: 0.95rem;
      color: #555;
      padding-left: 1em; /* Indent definition slightly */
    }
  `;

  constructor() {
    super();
    this.vocabulary = [];
  }

  render() {
    if (!this.vocabulary || this.vocabulary.length === 0) {
      return html`<p>No vocabulary terms provided.</p>`;
    }

    return html`
      <ul>
        ${map(this.vocabulary, (item) => html`
          <li>
            <strong>${item.term}</strong>
            <span class="definition">${item.definition}</span>
          </li>
        `)}
      </ul>
    `;
  }
}

customElements.define('lesson-vocabulary', LessonVocabulary); 