import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from '../toast-container.js';

export class DisplayControls extends LitElement {
  static get properties() {
    return {
      content: { type: String },
      title: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .story-controls {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }

      .control-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        background: var(--bg, #f8f9fa);
        color: var(--text-secondary, #6c757d);
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
      }

      .control-button:hover {
        background: var(--primary-50, #eef2ff);
        color: var(--primary, #5e7ce6);
        transform: translateY(-1px);
      }

      .control-button svg {
        width: 1rem;
        height: 1rem;
      }

      @media (max-width: 768px) {
        .story-controls {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    `;
  }

  constructor() {
    super();
    this.content = '';
    this.title = 'Story';
    this._isCopied = false;
  }

  async _handleCopy() {
    if (this.content) {
      try {
        await navigator.clipboard.writeText(this.content);
        this._isCopied = true;
        
        showToast('Story copied to clipboard!', 'success');
        
        setTimeout(() => {
          this._isCopied = false;
          this.requestUpdate();
        }, 2000);
        
        this.requestUpdate();
      } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy text', 'error');
      }
    }
  }

  _handlePrint() {
    if (this.content) {
      const printWindow = window.open('', '_blank');
      
      // Convert content to paragraphs
      const paragraphs = this.content
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${p}</p>`)
        .join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${this.title || 'Story'}</title>
            <style>
              body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; padding: 2rem; }
              h1 { margin-bottom: 2rem; }
              p { margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <h1>${this.title || 'Story'}</h1>
            ${paragraphs}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  _handleSave() {
    if (this.content) {
      const blob = new Blob([this.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.title || 'story'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Story saved as text file', 'success');
    }
  }

  _handleTextToSpeech() {
    if (window.speechSynthesis && this.content) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(this.content);
      
      // Set properties (optional)
      utterance.rate = 0.9; // slightly slower than default
      utterance.pitch = 1;
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      showToast('Text-to-speech started', 'info');
    } else {
      showToast('Text-to-speech not available', 'error');
    }
  }

  render() {
    return html`
      <div class="story-controls">
        <button @click=${this._handleCopy} class="control-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          ${this._isCopied ? 'Copied!' : 'Copy'}
        </button>
        
        <button @click=${this._handlePrint} class="control-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9V2h12v7"></path>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <path d="M6 14h12v8H6z"></path>
          </svg>
          Print
        </button>
        
        <button @click=${this._handleSave} class="control-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Save
        </button>
        
        <button @click=${this._handleTextToSpeech} class="control-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 6v12M8 9v6M16 9v6M20 12h2M2 12h2"></path>
          </svg>
          Listen
        </button>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('display-controls')) {
  customElements.define('display-controls', DisplayControls);
} 