import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';

// Import refactored form components
import '/components/form/form-settings-card.js';
import '/components/form/form-input-group.js';
import '/components/form/form-grid.js';
import '/components/form/form-checkbox-options.js';
import '/components/form/submit-button.js';

export class LessonForm extends LitElement {
  static get properties() {
    return {
      isSubmitting: { type: Boolean },
      subjects: { type: Array },
      gradeLevels: { type: Array },
      wordCounts: { type: Array },
      languages: { type: Array }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--font-body, 'Source Serif Pro', Georgia, 'Times New Roman', serif);
      }

      .form-section {
        background: var(--card-bg, white);
        border-radius: 32px;
        padding: 3rem;
        box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
        margin-bottom: 3rem;
        border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        transition: var(--transition-normal, all 0.3s ease);
      }

      .form-section:hover {
        box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
        transform: translateY(-2px);
      }

      .form-container {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      @media (max-width: 768px) {
        .form-section {
          padding: 1.5rem;
          border-radius: 24px;
        }
      }
    `;
  }

  constructor() {
    super();
    this.isSubmitting = false;
    
    this.subjects = [
      { value: 'law', label: 'Law' },
      { value: 'medicine', label: 'Medicine' },
      { value: 'chemistry', label: 'Chemistry' },
      { value: 'biology', label: 'Biology' },
      { value: 'physics', label: 'Physics' },
      { value: 'mathematics', label: 'Mathematics' },
      { value: 'history', label: 'History' },
      { value: 'literature', label: 'Literature' },
      { value: 'other', label: 'Other' }
    ];

    this.gradeLevels = [
      { value: 'K', label: 'Kindergarten' },
      { value: '1', label: 'Grade 1' },
      { value: '2', label: 'Grade 2' },
      { value: '3', label: 'Grade 3' },
      { value: '4', label: 'Grade 4' },
      { value: '5', label: 'Grade 5' },
      { value: '6', label: 'Grade 6' },
      { value: '7', label: 'Grade 7' },
      { value: '8', label: 'Grade 8' },
      { value: '9', label: 'Grade 9' },
      { value: '10', label: 'Grade 10' },
      { value: '11', label: 'Grade 11' },
      { value: '12', label: 'Grade 12' },
      { value: 'university', label: 'University' }
    ];

    this.wordCounts = [
      { value: '300', label: '300 words' },
      { value: '500', label: '500 words' },
      { value: '750', label: '750 words' }
    ];

    this.languages = [
      { value: 'English', label: 'English' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'French', label: 'French' },
      { value: 'German', label: 'German' },
      { value: 'Italian', label: 'Italian' },
      { value: 'Portuguese', label: 'Portuguese' },
      { value: 'Russian', label: 'Russian' },
      { value: 'Chinese', label: 'Chinese' },
      { value: 'Japanese', label: 'Japanese' },
      { value: 'Korean', label: 'Korean' }
    ];
  }

  _handleInputChange(e) {
    const { name, value } = e.target;
    this[name] = value;
    this.requestUpdate();
  }

  _handleSubmit(e) {
    e.preventDefault();
    
    if (!this._validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.requestUpdate();

    const formData = {
      subject: this.subject,
      academic_grade: this.academic_grade,
      word_count: this.word_count,
      language: this.language,
      generate_vocabulary: this.generate_vocabulary,
      generate_summary: this.generate_summary,
      generate_quiz: this.generate_quiz
    };

    this.dispatchEvent(new CustomEvent('submit', {
      detail: formData,
      bubbles: true,
      composed: true
    }));
  }

  _validateForm() {
    if (!this.subject) {
      showToast('Please select a subject', 'error');
      return false;
    }

    if (!this.academic_grade) {
      showToast('Please select a grade level', 'error');
      return false;
    }

    if (!this.word_count) {
      showToast('Please select a word count', 'error');
      return false;
    }

    if (!this.language) {
      showToast('Please select a language', 'error');
      return false;
    }

    return true;
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <div class="form-section">
          <div class="form-container">
            <form-grid>
              <form-input-group
                name="subject"
                label="Subject"
                type="select"
                .options=${this.subjects}
                .value=${this.subject}
                @change=${this._handleInputChange}
                required
              ></form-input-group>

              <form-input-group
                name="academic_grade"
                label="Grade Level"
                type="select"
                .options=${this.gradeLevels}
                .value=${this.academic_grade}
                @change=${this._handleInputChange}
                required
              ></form-input-group>

              <form-input-group
                name="word_count"
                label="Word Count"
                type="select"
                .options=${this.wordCounts}
                .value=${this.word_count}
                @change=${this._handleInputChange}
                required
              ></form-input-group>

              <form-input-group
                name="language"
                label="Language"
                type="select"
                .options=${this.languages}
                .value=${this.language}
                @change=${this._handleInputChange}
                required
              ></form-input-group>
            </form-grid>

            <form-settings-card>
              <form-checkbox-options
                name="generate_vocabulary"
                label="Generate Vocabulary List"
                .checked=${this.generate_vocabulary}
                @change=${this._handleInputChange}
              ></form-checkbox-options>

              <form-checkbox-options
                name="generate_summary"
                label="Generate Summary"
                .checked=${this.generate_summary}
                @change=${this._handleInputChange}
              ></form-checkbox-options>

              <form-checkbox-options
                name="generate_quiz"
                label="Generate Quiz"
                .checked=${this.generate_quiz}
                @change=${this._handleInputChange}
              ></form-checkbox-options>
            </form-settings-card>

            <submit-button
              .isSubmitting=${this.isSubmitting}
              text="Generate Lesson"
            ></submit-button>
          </div>
        </div>
      </form>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('lesson-form')) {
  customElements.define('lesson-form', LessonForm);
} 