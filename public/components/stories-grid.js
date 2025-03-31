import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import '/components/grid/grid-loading.js';
import '/components/grid/grid-error.js';
import '/components/grid/grid-empty-state.js';
import '/components/grid/story-item.js';
import '/components/grid/refresh-button.js';

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
      return html`<grid-loading></grid-loading>`;
    }
    
    if (this.error) {
      return html`
        <grid-error 
          message=${this.error} 
          .onRetry=${() => this._loadStories()}>
        </grid-error>
      `;
    }
    
    if (!this.stories || this.stories.length === 0) {
      return html`
        <grid-empty-state
          title="No Stories Yet"
          message="Generate your first story to see it here!"
          icon="📚"
          .onRefresh=${() => this._loadStories()}>
        </grid-empty-state>
      `;
    }
    
    return html`
      <refresh-button
        label="Refresh"
        .onClick=${() => this._loadStories()}>
      </refresh-button>
      
      <div class="stories-grid">
        ${this.stories.map(story => html`
          <story-item
            .story=${story}
            .onClick=${(story) => this._handleStoryClick(story)}>
          </story-item>
        `)}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('stories-grid')) {
  customElements.define('stories-grid', StoriesGrid);
} 