import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { showToast } from './toast-container.js';

// Import refactored form components
import './form/form-settings-card.js';
import './form/form-input-group.js';
import './form/form-grid.js';
import './form/form-checkbox-options.js';
import './form/submit-button.js';

export class StoryForm extends LitElement {
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
    console.log('StoryForm constructor called');
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
      { value: '12', label: 'Grade 12' }
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
      { value: 'Italian', label: 'Italian' }
    ];

    this._formData = {
      academic_grade: '',
      subject: '',
      other_subject: '',
      subject_specification: '',
      setting: '',
      main_character: '',
      word_count: '300',
      language: 'English',
      generate_vocabulary: true,
      generate_summary: true,
      generate_quiz: true
    };

    this._showOtherSubject = false;
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('StoryForm connected to DOM');
    
    // Check if form is in shadow DOM
    setTimeout(() => {
      const formSection = this.shadowRoot?.querySelector('.form-section');
      console.log('StoryForm shadow DOM rendered:', !!formSection);
      
      // Register with window for debugging
      if (!window._storyFormElements) {
        window._storyFormElements = [];
      }
      window._storyFormElements.push(this);
      
      // Add global access to the form for debugging
      window.mainStoryForm = this;
      
      // Dispatch event to notify that the form is ready
      this.dispatchEvent(new CustomEvent('story-form-ready', {
        bubbles: true,
        composed: true
      }));
    }, 100);
  }

  _handleInputChange(e) {
    const { name, value } = e.detail;
    
    this._formData = {
      ...this._formData,
      [name]: value
    };

    // Show/hide other subject field
    if (name === 'subject') {
      this._showOtherSubject = value === 'other';
      this.requestUpdate();
    }
  }

  _handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!this._validate()) {
      return;
    }
    
    // Prevent submitting if already in progress
    if (this.isSubmitting) {
      return;
    }
    
    // Update submission state
    this.isSubmitting = true;
    
    // Prepare data for submission
    const formData = { ...this._formData };
    
    // Ensure summary, vocabulary, and quiz generation are always enabled
    formData.generate_summary = true;
    formData.generate_vocabulary = true;
    formData.generate_quiz = true;
    
    // Log the final form data
    console.log('Submitting story form with data:', {
      ...formData,
      subject: formData.subject,
      academic_grade: formData.academic_grade,
      generate_summary: formData.generate_summary,
      generate_vocabulary: formData.generate_vocabulary,
      generate_quiz: formData.generate_quiz
    });
    
    // Handle special case for other subject
    if (formData.subject === 'other' && formData.other_subject) {
      formData.subject = formData.other_subject;
      delete formData.other_subject;
    }
    
    // Convert word_count to number
    formData.word_count = parseInt(formData.word_count, 10);
    
    // Dispatch form submit event
    this.dispatchEvent(new CustomEvent('story-form-submit', {
      detail: { formData },
      bubbles: true,
      composed: true
    }));
  }

  _validate() {
    // Basic validation
    if (!this._formData.academic_grade) {
      this._showError('Please select an academic grade');
      return false;
    }
    
    if (!this._formData.subject) {
      this._showError('Please select a subject');
      return false;
    }
    
    if (this._formData.subject === 'other' && !this._formData.other_subject) {
      this._showError('Please specify the other subject');
      return false;
    }
    
    return true;
  }

  _showError(message) {
    // If toast system is available, use it
    if (typeof window.showToast === 'function') {
      window.showToast(message, 'error');
    } else if (typeof showToast === 'function') {
      showToast(message, 'error');
    } else {
      alert(message);
    }
  }

  render() {
    return html`
      <div class="form-section">
        <form @submit=${this._handleSubmit}>
          <div class="form-container">
            <!-- Content Settings Card -->
            <form-settings-card title="Content Settings">
              <form-grid>
                <form-input-group
                  label="Academic Level"
                  name="academic_grade"
                  type="select"
                  placeholder="Select your grade level..."
                  .value=${this._formData.academic_grade}
                  .options=${this.gradeLevels}
                  ?required=${true}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>

                <form-input-group
                  label="Subject Area"
                  name="subject"
                  type="select"
                  placeholder="Select a subject..."
                  .value=${this._formData.subject}
                  .options=${this.subjects}
                  ?required=${true}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>
              </form-grid>

              <form-input-group
                label="Specify Subject"
                name="other_subject"
                type="text"
                placeholder="e.g., Astronomy"
                .value=${this._formData.other_subject}
                ?disabled=${this.isSubmitting}
                ?hidden=${!this._showOtherSubject}
                @input-change=${this._handleInputChange}
              ></form-input-group>
            </form-settings-card>

            <!-- Topic Focus Card -->
            <form-settings-card title="Topic Focus">
              <form-input-group
                label="Topic Focus (optional)"
                name="subject_specification"
                type="text"
                placeholder="e.g., Genetics for Biology"
                .value=${this._formData.subject_specification}
                ?disabled=${this.isSubmitting}
                @input-change=${this._handleInputChange}
              ></form-input-group>
            </form-settings-card>

            <!-- Story Elements Card -->
            <form-settings-card title="Story Elements">
              <form-grid>
                <form-input-group
                  label="Story Setting (optional)"
                  name="setting"
                  type="text"
                  placeholder="e.g., a small village in the mountains"
                  .value=${this._formData.setting}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>

                <form-input-group
                  label="Main Character (optional)"
                  name="main_character"
                  type="text"
                  placeholder="e.g., a curious young scientist"
                  .value=${this._formData.main_character}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>
              </form-grid>
            </form-settings-card>

            <!-- Format Settings Card -->
            <form-settings-card title="Format Settings">
              <form-grid>
                <form-input-group
                  label="Story Length"
                  name="word_count"
                  type="select"
                  .value=${this._formData.word_count}
                  .options=${this.wordCounts}
                  ?required=${true}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>

                <form-input-group
                  label="Language"
                  name="language"
                  type="select"
                  .value=${this._formData.language}
                  .options=${this.languages}
                  ?required=${true}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>
              </form-grid>

              <form-checkbox-options>
                <form-input-group
                  label="Generate Vocabulary List"
                  name="generate_vocabulary"
                  type="checkbox"
                  .value=${this._formData.generate_vocabulary}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>

                <form-input-group
                  label="Generate Story Summary"
                  name="generate_summary"
                  type="checkbox"
                  .value=${this._formData.generate_summary}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>

                <form-input-group
                  label="Generate Comprehension Quiz"
                  name="generate_quiz"
                  type="checkbox"
                  .value=${this._formData.generate_quiz}
                  ?disabled=${this.isSubmitting}
                  @input-change=${this._handleInputChange}
                ></form-input-group>
              </form-checkbox-options>
            </form-settings-card>

            <submit-button
              ?isLoading=${this.isSubmitting}
              label="Generate Story"
              @button-click=${this._handleSubmit}
            ></submit-button>
          </div>
        </form>
      </div>
    `;
  }
}

// Guard against duplicate registration
if (!customElements.get('story-form')) {
  customElements.define('story-form', StoryForm);
} 