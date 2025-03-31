import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class FormGrid extends LitElement {
  static styles = css`
    .story-elements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(275px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .story-elements-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `;

  render() {
    return html`
      <div class="story-elements-grid">
        <slot></slot>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('form-grid')) {
  customElements.define('form-grid', FormGrid);
} 