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
      difficulty: 'same_level'
    };
    this._vocabularyItems = [];
  }

  static get styles() {
    return css`
      :host {
        display: block;
        margin: 2rem auto;
        padding-top: 2rem;
        border-top: 2px solid var(--border, rgba(0, 0, 0, 0.1));
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
        max-width: 800px;
      }

      h3 {
        color: var(--primary, #5e7ce6);
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        font-weight: 700;
        text-align: center;
      }

      .continuation-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        align-items: center;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        max-width: 400px;
      }

      .input-group label {
        font-weight: 600;
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1rem;
        color: var(--text-secondary, #6c757d);
        text-align: center;
      }

      select {
        padding: 0.75rem;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        border-radius: 8px;
        background-color: var(--bg, #f8f9fa);
        color: var(--text, #212529);
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
        font-size: 0.95rem;
        width: 100%;
        text-align: center;
        transition: all 0.2s ease;
      }

      select:focus {
        outline: none;
        border-color: var(--primary, #5e7ce6);
        box-shadow: 0 0 0 3px rgba(94, 124, 230, 0.1);
      }
      
      .difficulty-options {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }
      
      .difficulty-options label {
        font-weight: 600;
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1rem;
        color: var(--text-secondary, #6c757d);
      }
      
      .difficulty-buttons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
      }
      
      .difficulty-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem;
        border: 2px solid var(--border, rgba(0, 0, 0, 0.1));
        border-radius: 12px;
        background-color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 110px;
      }
      
      .difficulty-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .difficulty-button.active {
        border-color: var(--primary, #5e7ce6);
        background-color: var(--primary-50, #eef2ff);
      }
      
      .difficulty-emoji {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      
      .difficulty-label {
        font-size: 0.8rem;
        text-align: center;
        font-weight: 500;
      }

      .continue-button {
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
        margin-top: 1rem;
        min-width: 200px;
      }

      .continue-button:hover {
        background: var(--primary-600, #4a63b9);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      }

      .continue-button:disabled {
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
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
      }

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

      /* Vocabulary styling */
      .vocabulary-section {
        margin-top: 2rem;
        background-color: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #4285f4;
      }
      
      .vocabulary-section h3 {
        color: #333;
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.25rem;
      }
      
      .vocabulary-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }
      
      .vocabulary-item {
        background: white;
        padding: 1rem;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: transform 0.2s ease;
      }
      
      .vocabulary-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .vocabulary-term {
        color: #4285f4;
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
      }
      
      .vocabulary-definition {
        color: #555;
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.4;
      }
      
      /* Continuation result styling */
      .continuation-result {
        background-color: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .continuation-content {
        line-height: 1.6;
        color: #333;
      }
      
      .continuation-content p {
        margin-bottom: 1rem;
      }
      
      @media (max-width: 768px) {
        .difficulty-buttons {
          flex-direction: column;
          align-items: center;
        }
        
        .difficulty-button {
          width: 80%;
          flex-direction: row;
          justify-content: flex-start;
          gap: 1rem;
        }
        
        .difficulty-emoji {
          margin-bottom: 0;
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
    if (this.isSubmitting) return; 
    
    // Check if we have an original story
    if (!this.originalStory) {
      this._showError = true;
      this._errorMessage = 'No story to continue. Please generate a story first.';
      this.requestUpdate();
      return;
    }
    
    // Double-check that we have an actual story object with content
    if (!this.originalStory.content) {
      this._showError = true;
      this._errorMessage = 'Original story is missing content. Please regenerate the story.';
      console.error('Original story is missing content:', this.originalStory);
      this.requestUpdate();
      return;
    }
    
    this.isSubmitting = true;
    this._continuationContent = '';
    this._showError = false;
    this._errorMessage = '';
    this.requestUpdate();
    
    // Ensure we have a valid story object
    const originalStory = this.originalStory || {};
    
    // Generate a mock ID if one doesn't exist
    const storyId = originalStory.id || `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Make sure we have the content
    const originalContent = originalStory.content || '';
    
    if (!originalContent) {
      console.error('Original story content is empty even after checks');
    }
    
    // Map UI difficulty values to API values
    const difficultyMap = {
      'much_easier': 'much_easier',
      'slightly_easier': 'slightly_easier', 
      'same_level': 'same_level',
      'slightly_harder': 'slightly_harder',
      'much_harder': 'much_harder'
    };
    
    // Prepare options with complete original story content
    const options = {
      length: parseInt(this._settings.length, 10),
      difficulty: difficultyMap[this._settings.difficulty] || 'same_level',
      original_story_content: originalContent
    };
    
    // Log what we're about to do (limiting content length for logging)
    const logOptions = {...options};
    if (logOptions.original_story_content) {
      logOptions.original_story_content = logOptions.original_story_content.substring(0, 100) + '...';
    }
    console.log(`Continuing story ${storyId} with options:`, logOptions);
    console.log(`Original story content length: ${originalContent.length} characters`);
    
    try {
      // Check if API service exists and has the required method
      if (!window.apiService || typeof window.apiService.continueStory !== 'function') {
        throw new Error('API service not available');
      }
      
      // Use the API service to continue the story
      const data = await window.apiService.continueStory(storyId, options);
      
      // Process the continuation response
      if (data && data.continuation_text) {
        this._continuationContent = data.continuation_text;
        
        // Process vocabulary items if available
        if (data.vocabulary && Array.isArray(data.vocabulary)) {
          console.log('New vocabulary items:', data.vocabulary);
          this._vocabularyItems = data.vocabulary;
        } else {
          this._vocabularyItems = [];
        }
        
        // Dispatch event that continuation is ready
        const event = new CustomEvent('story-continued', { 
          detail: { 
            continuation: data.continuation_text,
            difficulty: data.difficulty,
            wordCount: data.word_count,
            vocabulary: data.vocabulary
          },
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      } else {
        throw new Error('Received empty or invalid continuation response');
      }
    } catch (error) {
      console.error('Error continuing story:', error);
      this._showError = true;
      this._errorMessage = `Failed to continue the story: ${error.message || 'Unknown error'}`;
      
      // Use mock data in development if API is unavailable
      if (window.ENV_USE_MOCK_DATA === true) {
        console.log('Using mock continuation data...');
        setTimeout(() => {
          this._continuationContent = "This is a mock continuation of the story. It would normally come from the API but is being generated locally for development purposes.\n\nThe characters continue their adventure with enthusiasm, learning more about their subject along the way.";
          this._showError = false;
          this._errorMessage = '';
          this._vocabularyItems = [
            { term: "Sample Term 1", definition: "This is a sample definition for demonstration purposes." },
            { term: "Sample Term 2", definition: "Another sample definition to show how vocabulary works." }
          ];
          this.requestUpdate();
        }, 1500);
      }
    } finally {
      this.isSubmitting = false;
      this.requestUpdate();
    }
  }

  render() {
    if (this._showError) {
      return html`
        <div class="continuation-error">
          <p>${this._errorMessage}</p>
        </div>
      `;
    }

    if (this._continuationContent) {
      // Process the text with proper paragraph breaks
      const formattedContinuation = this._continuationContent
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
        
      return html`
        <div class="continuation-result">
          <h3>Story Continuation</h3>
          <div class="continuation-content">
            <p .innerHTML=${formattedContinuation}></p>
          </div>
          ${this._renderVocabulary()}
        </div>
      `;
    }

    return html`
      <div class="continuation-form">
        <h3>Continue the Story</h3>
        
        <div class="input-group">
          <label for="length">Length</label>
          <select 
            id="length" 
            name="length" 
            @change="${this._handleInputChange}"
            ?disabled="${this.isSubmitting}"
          >
            <option value="200" ${this._settings.length === '200' ? 'selected' : ''}>Short (200 words)</option>
            <option value="300" ${this._settings.length === '300' ? 'selected' : ''}>Medium (300 words)</option>
            <option value="500" ${this._settings.length === '500' ? 'selected' : ''}>Long (500 words)</option>
          </select>
        </div>
        
        <div class="difficulty-options">
          <label>Difficulty Level</label>
          <div class="difficulty-buttons">
            <button 
              class="difficulty-button ${this._settings.difficulty === 'much_easier' ? 'active' : ''}" 
              @click="${() => this._handleDifficultyChange('much_easier')}"
              ?disabled="${this.isSubmitting}"
            >
              <span class="difficulty-emoji">😌</span>
              <span class="difficulty-label">Much Easier</span>
            </button>
            <button 
              class="difficulty-button ${this._settings.difficulty === 'slightly_easier' ? 'active' : ''}" 
              @click="${() => this._handleDifficultyChange('slightly_easier')}"
              ?disabled="${this.isSubmitting}"
            >
              <span class="difficulty-emoji">😊</span>
              <span class="difficulty-label">Slightly Easier</span>
            </button>
            <button 
              class="difficulty-button ${this._settings.difficulty === 'same_level' ? 'active' : ''}" 
              @click="${() => this._handleDifficultyChange('same_level')}"
              ?disabled="${this.isSubmitting}"
            >
              <span class="difficulty-emoji">😐</span>
              <span class="difficulty-label">Same Level</span>
            </button>
            <button 
              class="difficulty-button ${this._settings.difficulty === 'slightly_harder' ? 'active' : ''}" 
              @click="${() => this._handleDifficultyChange('slightly_harder')}"
              ?disabled="${this.isSubmitting}"
            >
              <span class="difficulty-emoji">🤔</span>
              <span class="difficulty-label">Slightly Harder</span>
            </button>
            <button 
              class="difficulty-button ${this._settings.difficulty === 'much_harder' ? 'active' : ''}" 
              @click="${() => this._handleDifficultyChange('much_harder')}"
              ?disabled="${this.isSubmitting}"
            >
              <span class="difficulty-emoji">🧠</span>
              <span class="difficulty-label">Much Harder</span>
            </button>
          </div>
        </div>
        
        ${this._renderDifficultyDescription()}
        
        <button 
          class="continue-button ${this.isSubmitting ? 'loading' : ''}" 
          @click="${this._handleContinue}"
          ?disabled="${this.isSubmitting || !this.originalStory}"
        >
          ${this.isSubmitting ? 
            html`<div class="spinner"></div> Generating...` : 
            'Continue Story'
          }
        </button>
      </div>
    `;
  }

  _renderDifficultyDescription() {
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

    const selected = descriptions[this._settings.difficulty] || descriptions['same_level'];

    return html`
      <div class="difficulty-description">
        <div class="difficulty-description-content ${selected.class}">
          <h4>${selected.title}</h4>
          <p>${selected.description}</p>
        </div>
      </div>
    `;
  }

  _renderVocabulary() {
    if (!this._vocabularyItems || this._vocabularyItems.length === 0) {
        return '';
    }

    const vocabItems = this._vocabularyItems.map(item => html`
        <div class="vocabulary-item">
            <h4 class="vocabulary-term">${item.term}</h4>
            <p class="vocabulary-definition">${item.definition}</p>
        </div>
    `).join('');

    return html`
        <div class="vocabulary-section">
            <h3>New Vocabulary</h3>
            <div class="vocabulary-list">
                ${vocabItems}
            </div>
        </div>
    `;
  }

  _handleDifficultyChange(difficulty) {
    this._settings.difficulty = difficulty;
    this.requestUpdate();
  }
}

// Register the component
customElements.define('story-continuation', StoryContinuation); 