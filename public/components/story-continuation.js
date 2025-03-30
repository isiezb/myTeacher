import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';

export class StoryContinuation extends LitElement {
  static get properties() {
    return {
      originalStory: { type: Object },
      isSubmitting: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.originalStory = null;
    this.isSubmitting = false;
    this._continuationContent = '';
    this._showError = false;
    this._errorMessage = '';
    this._settings = {
      length: '300',
      difficulty: 'same'
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 2px solid var(--border, rgba(0, 0, 0, 0.1));
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      }

      h3 {
        color: var(--primary, #5e7ce6);
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 700;
      }

      .continuation-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .continuation-options {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
        width: 100%;
      }

      .continuation-option {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .continuation-option label {
        font-weight: 600;
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 0.9rem;
        color: var(--text-secondary, #6c757d);
      }

      select {
        padding: 0.75rem;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        border-radius: 8px;
        background-color: var(--bg, #f8f9fa);
        color: var(--text, #212529);
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
        font-size: 0.95rem;
        min-width: 180px;
        transition: all 0.2s ease;
      }

      select:focus {
        outline: none;
        border-color: var(--primary, #5e7ce6);
        box-shadow: 0 0 0 3px rgba(94, 124, 230, 0.1);
      }

      button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        background: var(--primary, #5e7ce6);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        align-self: flex-start;
      }

      button:hover {
        background: var(--primary-600, #4a63b9);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      }

      button:disabled {
        background: var(--gray-500, #adb5bd);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .continuation-output {
        padding: 1.5rem 0;
        animation: fadeIn 0.5s ease-in-out;
      }

      .continuation-content {
        line-height: 1.7;
        color: var(--text, #212529);
      }

      .continuation-content p {
        margin-bottom: 1rem;
      }

      .continuation-error {
        color: var(--error, #f56565);
        padding: 1rem;
        border-radius: 8px;
        background-color: rgba(245, 101, 101, 0.1);
        border: 1px solid var(--error, #f56565);
        margin-top: 1rem;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        .continuation-options {
          flex-direction: column;
          gap: 0.75rem;
        }

        button {
          width: 100%;
        }
      }
    `;
  }

  _handleInputChange(e) {
    const { name, value } = e.target;
    this._settings = {
      ...this._settings,
      [name]: value
    };
    this.requestUpdate();
  }

  async _handleContinue() {
    if (!this.originalStory || !this.originalStory.id) {
      this._showError = true;
      this._errorMessage = 'No story to continue.';
      return;
    }

    this.isSubmitting = true;
    this._showError = false;
    this._errorMessage = '';

    try {
      // Show loading indicator
      window.showLoading?.('Continuing your story...');

      // Get the API service
      const apiService = window.apiService;
      
      if (apiService && typeof apiService.continueStory === 'function') {
        // Call the API to continue the story
        const result = await apiService.continueStory(this.originalStory.id, {
          length: parseInt(this._settings.length, 10),
          difficulty: this._settings.difficulty
        });
        
        // Set the continuation content
        this._continuationContent = result.continuation || result.content;
        
        // Show success message
        window.showToast?.('Story continued successfully!', 'success');
        
        // Dispatch event
        this.dispatchEvent(new CustomEvent('story-continued', {
          detail: { 
            originalStory: this.originalStory,
            continuation: this._continuationContent
          },
          bubbles: true,
          composed: true
        }));
      } else {
        // Mock response for testing
        console.log('Using mock continuation (no API service available)');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this._continuationContent = `This is a mock continuation of the story.\n\nThe ${this._settings.difficulty} difficulty continuation would be about ${this._settings.length} words long in the real implementation.\n\nIt would continue the narrative where the original story left off, maintaining the characters, setting, and educational focus.`;
        
        window.showToast?.('Story continued (mock data)', 'info');
      }
    } catch (error) {
      console.error('Error continuing story:', error);
      this._showError = true;
      this._errorMessage = error.message || 'Failed to continue the story. Please try again.';
      window.showToast?.('Failed to continue story.', 'error');
    } finally {
      this.isSubmitting = false;
      window.hideLoading?.();
    }
  }

  render() {
    return html`
      <h3>Continue the Story</h3>
      <div class="continuation-form">
        <div class="continuation-options">
          <div class="continuation-option">
            <label for="length">Length:</label>
            <select id="length" name="length" 
                    @change=${this._handleInputChange} 
                    ?disabled=${this.isSubmitting}>
              <option value="200" ?selected=${this._settings.length === '200'}>Short (200 words)</option>
              <option value="300" ?selected=${this._settings.length === '300'}>Medium (300 words)</option>
              <option value="500" ?selected=${this._settings.length === '500'}>Long (500 words)</option>
            </select>
          </div>
          
          <div class="continuation-option">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" name="difficulty" 
                    @change=${this._handleInputChange} 
                    ?disabled=${this.isSubmitting}>
              <option value="easier" ?selected=${this._settings.difficulty === 'easier'}>Easier</option>
              <option value="same" ?selected=${this._settings.difficulty === 'same'}>Same Level</option>
              <option value="harder" ?selected=${this._settings.difficulty === 'harder'}>More Challenging</option>
            </select>
          </div>
        </div>
        
        <button @click=${this._handleContinue} ?disabled=${this.isSubmitting}>
          ${this.isSubmitting 
            ? html`<div class="spinner"></div> Continuing...` 
            : 'Continue Story'}
        </button>
      </div>
      
      ${this._continuationContent 
        ? html`
          <div class="continuation-output">
            <div class="continuation-content">
              ${this._continuationContent.split('\n').map(p => html`<p>${p}</p>`)}
            </div>
          </div>
        ` 
        : ''}
        
      ${this._showError 
        ? html`
          <div class="continuation-error">
            ${this._errorMessage}
          </div>
        ` 
        : ''}
    `;
  }
}

customElements.define('story-continuation', StoryContinuation); 