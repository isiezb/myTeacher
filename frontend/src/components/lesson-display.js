import { LitElement, html, css, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked'; // Make sure marked is installed
import hljs from 'highlight.js'; // Assuming highlight.js for code blocks
// You might need to import highlight.js CSS separately in your main app styles
// or directly here if preferred.
// import hljsStyles from 'highlight.js/styles/github.css?inline'; // Example import

// Import the new sub-components
import './display/lesson-vocabulary.js';
import './display/lesson-summary.js';
import './display/lesson-quiz.js';

export class LessonDisplay extends LitElement {
  @property({ type: Object }) lessonData = null;

  // Configure marked
  constructor() {
    super();
    marked.setOptions({
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-',
      pedantic: false,
      gfm: true,
      breaks: false,
      sanitize: false, // Be careful with this in production
      smartLists: true,
      smartypants: false,
      xhtml: false
    });
  }

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-top: 1rem;
    }
    /* Keep existing h2, metadata styles */
    h2 {
      font-family: var(--font-serif, Georgia, serif);
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #2c3e50; /* Darker heading color */
      text-align: center;
      border-bottom: 2px solid var(--primary-color, #4a63b9);
      padding-bottom: 0.5rem;
    }
    .metadata {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem 1.5rem; /* Row and column gap */
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px dashed var(--border-color, #e0e0e0);
        font-size: 0.9rem;
        color: #555;
    }
    .metadata span {
        background-color: #f4f7fc;
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        border: 1px solid #d1d9e6;
    }
    .section {
        margin-bottom: 2rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color, #eee);
    }
    .section:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
    }

    .section h3 { /* Renamed from h2 in the original example for sub-sections */
        font-size: 1.3rem;
        color: var(--primary-color, #4a63b9);
        margin-bottom: 1rem;
        border-bottom: none; /* Removed border */
    }

    /* Basic styling for rendered markdown */
    .markdown-content :first-child { margin-top: 0; }
    .markdown-content h1, .markdown-content h2, .markdown-content h3 {
        margin-top: 1.5em;
        margin-bottom: 0.8em;
        line-height: 1.3;
        font-family: var(--font-sans); /* Use sans for markdown headings */
        color: #34495e;
    }
     .markdown-content h4, .markdown-content h5, .markdown-content h6 {
        margin-top: 1.2em;
        margin-bottom: 0.6em;
        font-family: var(--font-sans);
        color: #34495e;
     }
    .markdown-content p { margin-bottom: 1em; line-height: 1.7; font-family: var(--font-serif, Georgia, serif); font-size: 1.1rem; color: var(--text-color, #333); }
    .markdown-content ul, .markdown-content ol { margin-left: 1.5em; margin-bottom: 1em; font-family: var(--font-serif, Georgia, serif); font-size: 1.1rem; line-height: 1.7; }
    .markdown-content li { margin-bottom: 0.5em; }
    .markdown-content blockquote {
        margin: 1em 0;
        padding: 0.5em 1em;
        border-left: 4px solid #eee;
        color: #666;
        font-style: italic;
        background-color: #f8f9fa;
    }
    .markdown-content code:not(.hljs) { /* Inline code */
        background-color: #f1f3f5;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
        font-family: monospace;
    }
    .markdown-content pre {
        margin-bottom: 1em;
    }
    .markdown-content pre code.hljs { /* Code blocks */
        display: block;
        background: #2d2d2d; /* Example dark theme */
        color: #f1f3f5;
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
        font-family: monospace;
        font-size: 0.95em;
    }
    .markdown-content table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1em;
    }
    .markdown-content th, .markdown-content td {
        border: 1px solid #dfe2e5;
        padding: 0.6em 1em;
    }
    .markdown-content th {
        font-weight: bold;
        background-color: #f6f8fa;
    }

    /* Inject highlight.js styles if imported */
    /* ${unsafeCSS(hljsStyles)} */

    .continue-button {
        display: block;
        margin: 2rem auto 0 auto;
        padding: 0.8rem 1.8rem;
        background-color: var(--secondary-color, #6c757d); /* Different color */
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    .continue-button:hover {
        background-color: var(--secondary-hover-color, #5a6268);
    }
  `;

  _requestContinue() {
      if (!this.lessonData) return;
      const event = new CustomEvent('continue-lesson', {
          detail: { lessonData: this.lessonData },
          bubbles: true, // Allow event to bubble up through the DOM
          composed: true // Allow event to cross shadow DOM boundaries
      });
      this.dispatchEvent(event);
  }

  render() {
    if (!this.lessonData) {
      return html`<p>Loading lesson...</p>`;
    }

    // Attempt to render the main content using marked
    let renderedContent = '';
    try {
        // Use lessonData.content if it exists, otherwise default to empty string
        // Corrected: Use lessonData.lesson_content based on previous context
        renderedContent = this.lessonData.lesson_content ? unsafeHTML(marked.parse(this.lessonData.lesson_content)) : '';
    } catch (error) {
        console.error("Error rendering Markdown:", error);
        renderedContent = html`<p>Error displaying lesson content.</p>`;
    }

    return html`
      <h2>${this.lessonData.title || 'Untitled Lesson'}</h2>

        <div class="metadata">
            <span>Grade: ${this.lessonData.academic_grade || 'N/A'}</span>
            <span>Subject: ${this.lessonData.subject || 'N/A'}</span>
            ${this.lessonData.topic ? html`<span>Topic: ${this.lessonData.topic}</span>` : ''}
            <span>Style: ${this.lessonData.teacher_style || 'N/A'}</span>
            <span>~${this.lessonData.word_count || 0} words</span>
        </div>

      <div class="section">
        <h3>Lesson Content</h3>
        <div class="markdown-content">${renderedContent}</div>
      </div>

      ${this.lessonData.vocabulary && this.lessonData.vocabulary.length > 0 ? html`
        <div class="section">
          <h3>Vocabulary</h3>
          <lesson-vocabulary .vocabulary=${this.lessonData.vocabulary}></lesson-vocabulary>
        </div>
      ` : ''}

      ${this.lessonData.summary ? html`
        <div class="section">
          <h3>Summary</h3>
          <lesson-summary .summary=${this.lessonData.summary}></lesson-summary>
        </div>
      ` : ''}

      ${this.lessonData.quiz && this.lessonData.quiz.length > 0 ? html`
        <div class="section">
          <h3>Quiz</h3>
          <lesson-quiz .quizData=${this.lessonData.quiz}></lesson-quiz>
        </div>
      ` : ''}

      <!-- Add Continue Button -->
      <button class="continue-button" @click=${this._requestContinue}>
          Continue Lesson
      </button>
    `;
  }
}

customElements.define('lesson-display', LessonDisplay); 