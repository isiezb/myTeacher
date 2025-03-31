import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class FormCheckboxOptions extends LitElement {
  static styles = css`
    .checkbox-options {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .checkbox-options {
        gap: 0.75rem;
      }
    }
    
    @media (max-width: 500px) {
      .checkbox-options {
        gap: 0.5rem;
        margin-top: 1rem;
      }
      
      ::slotted(*) {
        transform: scale(0.9);
        transform-origin: left top;
      }
    }
  `;

  render() {
    return html`
      <div class="checkbox-options">
        <slot></slot>
      </div>
    `;
  }
}


// Guard against duplicate registration
if (!customElements.get('form-checkbox-options')) {
  customElements.define('form-checkbox-options', FormCheckboxOptions);
} 