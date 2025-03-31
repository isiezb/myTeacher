import { LitElement, html, css } from 'lit';

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
        gap: 1rem;
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

customElements.define('form-checkbox-options', FormCheckboxOptions); 