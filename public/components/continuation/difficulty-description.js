import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class DifficultyDescription extends LitElement {
  static properties = {
    difficulty: { type: String }
  };

  static styles = css`
    .difficulty-description {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      transition: all 0.3s ease;
    }

    .difficulty-description-content {
      padding: 1rem;
      border-radius: 8px;
      background-color: var(--bg, #f8f9fa);
      border-left: 4px solid var(--primary, #5e7ce6);
      transition: all 0.3s ease;
    }

    .difficulty-description-content h4 {
      font-family: var(--font-heading, 'Inter', sans-serif);
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: var(--text, #212529);
      text-align: center;
    }

    .difficulty-description-content p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-secondary, #6c757d);
      text-align: center;
    }

    .difficulty-description-content.easier {
      border-left-color: var(--info, #38b2ac);
    }

    .difficulty-description-content.same {
      border-left-color: var(--primary, #5e7ce6);
    }

    .difficulty-description-content.harder {
      border-left-color: var(--warning, #d69e2e);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  constructor() {
    super();
    this.difficulty = 'same_level';
  }

  render() {
    const descriptions = {
      'much_easier': {
        title: 'Much Easier',
        description: 'Uses significantly simpler vocabulary and shorter sentences. Ideal for building confidence with beginner readers or those struggling with the original difficulty level.',
        class: 'easier'
      },
      'slightly_easier': {
        title: 'Slightly Easier',
        description: 'Moderately simplifies vocabulary and sentence structure. Good for readers who found the original slightly challenging.',
        class: 'easier'
      },
      'same_level': {
        title: 'Same Level',
        description: 'Maintains the same vocabulary level and sentence complexity as the original story.',
        class: 'same'
      },
      'slightly_harder': {
        title: 'Slightly Harder',
        description: 'Introduces somewhat more advanced vocabulary and more complex sentences. Good for readers ready for a small challenge.',
        class: 'harder'
      },
      'much_harder': {
        title: 'Much Harder',
        description: 'Uses significantly more advanced vocabulary and complex sentence structures. Ideal for pushing advanced readers to the next level.',
        class: 'harder'
      }
    };

    const selected = descriptions[this.difficulty] || descriptions['same_level'];

    return html`
      <div class="difficulty-description">
        <div class="difficulty-description-content ${selected.class}">
          <h4>${selected.title}</h4>
          <p>${selected.description}</p>
        </div>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('difficulty-description')) {
  customElements.define('difficulty-description'
} 