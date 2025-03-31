import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ThemeToggle extends LitElement {
  static properties = {
    isDarkMode: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .theme-toggle {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: var(--text);
    }

    .theme-toggle:hover {
      background-color: var(--neutral-100);
    }

    .dark-theme .theme-toggle:hover {
      background-color: var(--neutral-800);
    }

    .icon {
      width: 24px;
      height: 24px;
      transition: all 0.5s ease;
    }

    .sun-icon, .moon-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .sun-icon {
      opacity: ${props => props.isDarkMode ? 0 : 1};
      transform: ${props => props.isDarkMode ? 'translate(-50%, -50%) rotate(90deg) scale(0.5)' : 'translate(-50%, -50%) rotate(0) scale(1)'};
    }

    .moon-icon {
      opacity: ${props => props.isDarkMode ? 1 : 0};
      transform: ${props => props.isDarkMode ? 'translate(-50%, -50%) rotate(0) scale(1)' : 'translate(-50%, -50%) rotate(-90deg) scale(0.5)'};
    }
  `;

  constructor() {
    super();
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this._applyTheme();
  }

  connectedCallback() {
    super.connectedCallback();
    // Listen for theme changes from other components
    window.addEventListener('themeChange', (e) => {
      this.isDarkMode = e.detail.isDarkMode;
    });
  }

  _applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', this.isDarkMode);
    // Dispatch event to notify other components
    this.dispatchEvent(new CustomEvent('themeChange', {
      detail: { isDarkMode: this.isDarkMode },
      bubbles: true,
      composed: true
    }));
  }

  _toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this._applyTheme();
  }

  render() {
    return html`
      <button class="theme-toggle" @click="${this._toggleTheme}" aria-label="${this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}">
        <svg class="icon sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="icon moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
    `;
  }
}

// Register the component
customElements.define('theme-toggle', ThemeToggle); 