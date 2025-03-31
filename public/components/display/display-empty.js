import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class DisplayEmpty extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      message: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        animation: fadeIn 0.4s ease-in-out;
      }

      svg {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
        color: var(--text-secondary, #6c757d);
      }

      h3 {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
        color: var(--text, #212529);
      }

      p {
        font-size: 1rem;
        color: var(--text-secondary, #6c757d);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  constructor() {
    super();
    this.title = 'No Story Generated Yet';
    this.message = 'Fill in the form to generate an educational story';
  }

  render() {
    return html`
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3>${this.title}</h3>
        <p>${this.message}</p>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('display-empty')) {
  customElements.define('display-empty', DisplayEmpty);
} 