import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import '/components/story-card.js';

export class StoriesGrid extends LitElement {
  static get properties() {
    return {
      stories: { type: Array },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  constructor() {
    super();
    this.stories = [];
    this.loading = true;
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadStories();
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .stories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        background: var(--bg, #f8f9fa);
        border-radius: 12px;
        margin: 2rem 0;
      }

      .empty-state-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--text-secondary, #6c757d);
      }

      .empty-state-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-weight: 600;
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--text, #212529);
      }

      .empty-state-text {
        font-size: 1rem;
        color: var(--text-secondary, #6c757d);
        margin-bottom: 1.5rem;
      }

      .error-message {
        padding: 1rem;
        background: rgba(245, 101, 101, 0.1);
        border: 1px solid var(--error, #f56565);
        border-radius: 8px;
        color: var(--error-dark, #c53030);
        margin-bottom: 1.5rem;
      }

      .loading-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(94, 124, 230, 0.2);
        border-radius: 50%;
        border-top-color: var(--primary, #5e7ce6);
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .story-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 1.5rem;
        transition: all 0.3s ease;
        cursor: pointer;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
      }
      
      .story-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        border-color: var(--primary, #5e7ce6);
      }
      
      .story-title {
        font-family: var(--font-heading, 'Inter', sans-serif);
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
        color: var(--text, #212529);
      }
      
      .story-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary, #6c757d);
      }
      
      .story-excerpt {
        font-size: 0.95rem;
        color: var(--text, #212529);
        margin-top: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .refresh-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary, #5e7ce6);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 1.5rem;
      }
      
      .refresh-button:hover {
        background: var(--primary-dark, #4b63b8);
      }

      @media (max-width: 768px) {
        .stories-grid {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
      }
    `;
  }

  async _loadStories() {
    this.loading = true;
    this.error = null;
    this.requestUpdate();
    
    try {
      if (window.SupabaseService && typeof window.SupabaseService.getStories === 'function') {
        console.log('Loading stories from database...');
        const stories = await window.SupabaseService.getStories();
        this.stories = stories;
        console.log('Loaded stories:', this.stories);
      } else {
        console.warn('Supabase Service not available, using mock data');
        await this._loadMockStories();
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      this.error = error.message || 'Failed to load stories';
      // Fall back to mock data if available
      await this._loadMockStories();
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }
  
  async _loadMockStories() {
    // Create some mock stories for development
    this.stories = [
      {
        id: 'mock-1',
        title: 'The Amazing Journey Through Science',
        content: 'Once upon a time, a curious student discovered the fascinating world of science...',
        subject: 'Science',
        academic_grade: '5',
        word_count: 300,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-2',
        title: 'Mathematics Magic',
        content: 'In a world of numbers, patterns began to emerge that changed everything...',
        subject: 'Mathematics',
        academic_grade: '7',
        word_count: 500,
        created_at: new Date(Date.now() - 86400000).toISOString() // yesterday
      }
    ];
    console.log('Created mock stories:', this.stories);
    return this.stories;
  }
  
  _handleStoryClick(story) {
    console.log('Story clicked:', story);
    
    // Set the story as the current story
    window.currentStory = story;
    
    // Find the story content component
    const storyContent = document.querySelector('#storyContent');
    if (storyContent) {
      storyContent.story = story;
    }
    
    // Hide the stories grid
    this.classList.add('hidden');
    
    // Show the selected story view
    const selectedStoryView = document.getElementById('selected-story-view');
    if (selectedStoryView) {
      selectedStoryView.classList.remove('hidden');
    }
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('story-selected', {
      detail: { story },
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    if (this.loading) {
      return html`
        <div class="loading-indicator">
          <div class="spinner"></div>
        </div>
      `;
    }
    
    if (this.error) {
      return html`
        <div class="error-message">
          <p>Error loading stories: ${this.error}</p>
          <button @click=${this._loadStories} class="refresh-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Try Again
          </button>
        </div>
      `;
    }
    
    if (!this.stories || this.stories.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3 class="empty-state-title">No Stories Yet</h3>
          <p class="empty-state-text">Generate your first story to see it here!</p>
          <button @click=${this._loadStories} class="refresh-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh
          </button>
        </div>
      `;
    }
    
    return html`
      <button @click=${this._loadStories} class="refresh-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Refresh
      </button>
      <div class="stories-grid">
        ${this.stories.map(story => html`
          <div class="story-card" @click=${() => this._handleStoryClick(story)}>
            <h3 class="story-title">${story.title}</h3>
            <div class="story-meta">
              <span>${story.subject}</span>
              <span>•</span>
              <span>Grade ${story.academic_grade}</span>
              <span>•</span>
              <span>${story.word_count} words</span>
              <span>•</span>
              <span>${this._formatDate(story.created_at)}</span>
            </div>
            <div class="story-excerpt">${story.content.substring(0, 150)}...</div>
          </div>
        `)}
      </div>
    `;
  }
  
  _formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

customElements.define('stories-grid', StoriesGrid); 