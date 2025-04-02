import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';
import './lesson-form.js';
import './lesson-list.js';
import './lesson-page.js';

export class LessonApp extends LitElement {
  static get properties() {
    return {
      lessons: { type: Array },
      currentLesson: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
      view: { type: String } // 'list' or 'lesson'
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .app-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .app-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .app-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text, #212529);
        margin: 0 0 1rem 0;
      }

      .app-subtitle {
        font-size: 1.25rem;
        color: var(--text-secondary, #6c757d);
        margin: 0;
      }

      .error-state {
        text-align: center;
        padding: 2rem;
        color: var(--error, #dc3545);
      }

      .loading-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary, #6c757d);
      }

      @media (max-width: 768px) {
        :host {
          padding: 1rem;
        }

        .app-title {
          font-size: 2rem;
        }

        .app-subtitle {
          font-size: 1.125rem;
        }
      }
    `;
  }

  constructor() {
    super();
    this.lessons = [];
    this.currentLesson = null;
    this.loading = false;
    this.error = null;
    this.view = 'list';
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadLessons();
  }

  async _loadLessons() {
    try {
      this.loading = true;
      this.error = null;
      this.requestUpdate();

      const response = await fetch('/api/lessons');
      if (!response.ok) {
        throw new Error('Failed to load lessons');
      }

      this.lessons = await response.json();
    } catch (error) {
      this.error = error.message;
      showToast('Failed to load lessons', 'error');
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  _handleGenerateLesson(e) {
    const formData = e.detail;
    this._createLesson(formData);
  }

  async _createLesson(formData) {
    try {
      this.loading = true;
      this.error = null;
      this.requestUpdate();

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      const newLesson = await response.json();
      this.lessons = [...this.lessons, newLesson];
      this.currentLesson = newLesson;
      this.view = 'lesson';
      showToast('Lesson created successfully', 'success');
    } catch (error) {
      this.error = error.message;
      showToast('Failed to create lesson', 'error');
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  _handleViewLesson(e) {
    const lessonId = e.detail.lessonId;
    this.currentLesson = this.lessons.find(lesson => lesson.id === lessonId);
    this.view = 'lesson';
  }

  _handleDeleteLesson(e) {
    const lessonId = e.detail.lessonId;
    this._deleteLesson(lessonId);
  }

  async _deleteLesson(lessonId) {
    try {
      this.loading = true;
      this.error = null;
      this.requestUpdate();

      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      this.lessons = this.lessons.filter(lesson => lesson.id !== lessonId);
      if (this.currentLesson?.id === lessonId) {
        this.currentLesson = null;
        this.view = 'list';
      }
      showToast('Lesson deleted successfully', 'success');
    } catch (error) {
      this.error = error.message;
      showToast('Failed to delete lesson', 'error');
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  _handleContinueLesson(e) {
    const lessonId = e.detail.lessonId;
    this._continueLesson(lessonId);
  }

  async _continueLesson(lessonId) {
    try {
      this.loading = true;
      this.error = null;
      this.requestUpdate();

      const response = await fetch(`/api/lessons/${lessonId}/continue`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to continue lesson');
      }

      const updatedLesson = await response.json();
      this.lessons = this.lessons.map(lesson => 
        lesson.id === lessonId ? updatedLesson : lesson
      );
      this.currentLesson = updatedLesson;
      showToast('Lesson continued successfully', 'success');
    } catch (error) {
      this.error = error.message;
      showToast('Failed to continue lesson', 'error');
    } finally {
      this.loading = false;
      this.requestUpdate();
    }
  }

  _handleBackToList() {
    this.currentLesson = null;
    this.view = 'list';
  }

  render() {
    if (this.error) {
      return html`
        <div class="error-state">
          ${this.error}
        </div>
      `;
    }

    return html`
      <div class="app-container">
        <div class="app-header">
          <h1 class="app-title">EasyLesson</h1>
          <p class="app-subtitle">Create engaging educational lessons with AI</p>
        </div>

        ${this.loading ? html`
          <div class="loading-state">
            Loading...
          </div>
        ` : this.view === 'list' ? html`
          <lesson-form
            @submit=${this._handleGenerateLesson}
          ></lesson-form>

          <lesson-list
            .lessons=${this.lessons}
            @view-lesson=${this._handleViewLesson}
            @delete-lesson=${this._handleDeleteLesson}
          ></lesson-list>
        ` : html`
          <lesson-page
            .lesson=${this.currentLesson}
            @continue-lesson=${this._handleContinueLesson}
            @delete-lesson=${this._handleDeleteLesson}
            @back-to-list=${this._handleBackToList}
          ></lesson-page>
        `}
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-app')) {
  customElements.define('lesson-app', LessonApp);
} 