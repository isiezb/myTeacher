import { LitElement, html, css } from 'lit';
import { map } from 'lit/directives/map.js'; // For rendering lists

// Define initial options (can be expanded later)
const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'University'];
const SUBJECTS = ['Mathematics', 'Science', 'History', 'Literature', 'Art', 'Computer Science', 'Other'];
const TEACHER_STYLES = ['Encouraging', 'Structured', 'Creative', 'Direct'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German'];

export class LessonForm extends LitElement {
  static properties = {
    _formData: { state: true }, // Internal state for form data
    isSubmitting: { type: Boolean }, // Passed in if needed
  };

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      background-color: var(--card-bg, #fff);
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    input, select, textarea {
      padding: 0.75rem;
      border: 1px solid var(--border-color, #ccc);
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary-color, #4a63b9);
      box-shadow: 0 0 0 2px rgba(74, 99, 185, 0.2);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    button[type="submit"] {
      grid-column: 1 / -1; /* Span full width */
      padding: 0.8rem 1.5rem;
      background-color: var(--primary-color, #4a63b9);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    button[type="submit"]:hover:not(:disabled) {
      background-color: #3a509a; /* Darker primary */
    }

    button[type="submit"]:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .checkbox-group {
        grid-column: 1 / -1;
        border-top: 1px solid var(--border-color, #eee);
        padding-top: 1rem;
        margin-top: 1rem;
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
    }
    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .checkbox-item label {
        margin-bottom: 0; /* Remove bottom margin for checkbox labels */
        font-weight: normal;
    }
    input[type="checkbox"] {
      width: 1.1em;
      height: 1.1em;
    }

    .full-width {
        grid-column: 1 / -1;
    }
    .hidden {
        display: none;
    }
  `;

  constructor() {
    super();
    this.isSubmitting = false;
    this._resetFormData();
    this._showOtherSubject = false; // State to track if 'Other' subject is selected
  }

  _resetFormData() {
    this._formData = {
      academic_grade: GRADE_LEVELS[5], // Default to Grade 5
      subject: SUBJECTS[0],
      other_subject: '', // Store 'Other' subject text here
      topic: '',
      teacher_style: TEACHER_STYLES[0],
      word_count: 300,
      language: LANGUAGES[0],
      include_summary: true,
      include_vocabulary: true,
      include_quiz: true,
      user_prompt_addition: ''
    };
  }

  _handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    const formValue = type === 'checkbox' ? checked : value;

    this._formData = { ...this._formData, [name]: formValue };

    // Special handling for 'Other' subject
    if (name === 'subject') {
      const showOther = value === 'Other';
      if (this._showOtherSubject !== showOther) {
          this._showOtherSubject = showOther;
          // Reset other_subject if 'Other' is deselected
          if (!showOther) {
              this._formData.other_subject = '';
          }
          this.requestUpdate(); // Trigger re-render to show/hide the field
      }
    }
  }

  _handleSubmit(e) {
    e.preventDefault();
    if (this.isSubmitting) return;

    // Basic validation
    if (this._formData.subject === 'Other' && !this._formData.other_subject?.trim()) {
        alert('Please specify the subject when "Other" is selected.');
        // TODO: Use a better notification system than alert()
        return;
    }

    console.log('Submitting form data:', this._formData);

    // Prepare data to dispatch (handle 'Other' subject)
    const dataToSubmit = { ...this._formData };
    if (dataToSubmit.subject === 'Other') {
        dataToSubmit.subject = dataToSubmit.other_subject; // Use the specified subject
    }
    delete dataToSubmit.other_subject; // Remove temporary field

    // Convert word_count to number if it's a string
    if (typeof dataToSubmit.word_count === 'string') {
        dataToSubmit.word_count = parseInt(dataToSubmit.word_count, 10);
    }

    // Dispatch an event with the form data
    this.dispatchEvent(new CustomEvent('generate-lesson-request', {
      detail: dataToSubmit,
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <!-- Basic Info -->
        <div class="form-group">
          <label for="academic_grade">Grade Level</label>
          <select id="academic_grade" name="academic_grade" .value=${this._formData.academic_grade} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
            ${map(GRADE_LEVELS, (grade) => html`<option value=${grade}>${grade}</option>`)}
          </select>
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <select id="subject" name="subject" .value=${this._formData.subject} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
             ${map(SUBJECTS, (subj) => html`<option value=${subj}>${subj}</option>`)}
          </select>
        </div>

        <!-- Conditional "Other Subject" field -->
        <div class="form-group full-width ${this._showOtherSubject ? '' : 'hidden'}">
            <label for="other_subject">Please Specify Subject:</label>
            <input
                type="text"
                id="other_subject"
                name="other_subject"
                .value=${this._formData.other_subject}
                @input=${this._handleInputChange}
                placeholder="e.g., Astronomy"
                ?disabled=${this.isSubmitting}
            />
        </div>

        <div class="form-group full-width">
          <label for="topic">Specific Topic (Optional)</label>
          <input type="text" id="topic" name="topic" .value=${this._formData.topic} @input=${this._handleInputChange} placeholder="e.g., Photosynthesis, The Cold War" ?disabled=${this.isSubmitting}>
        </div>

        <!-- Style & Format -->
         <div class="form-group">
          <label for="teacher_style">Teaching Style</label>
          <select id="teacher_style" name="teacher_style" .value=${this._formData.teacher_style} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
            ${map(TEACHER_STYLES, (style) => html`<option value=${style}>${style}</option>`)}
          </select>
        </div>

        <div class="form-group">
          <label for="word_count">Approx. Word Count</label>
          <select id="word_count" name="word_count" .value=${String(this._formData.word_count)} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
            <option value="200">~200</option>
            <option value="300">~300</option>
            <option value="500">~500</option>
            <option value="750">~750</option>
            <option value="1000">~1000</option>
          </select>
        </div>

        <div class="form-group">
          <label for="language">Language</label>
          <select id="language" name="language" .value=${this._formData.language} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
             ${map(LANGUAGES, (lang) => html`<option value=${lang}>${lang}</option>`)}
          </select>
        </div>

         <!-- Optional Content -->
         <div class="checkbox-group">
            <div class="checkbox-item">
                <input type="checkbox" id="include_summary" name="include_summary" .checked=${this._formData.include_summary} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
                <label for="include_summary">Include Summary</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="include_vocabulary" name="include_vocabulary" .checked=${this._formData.include_vocabulary} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
                <label for="include_vocabulary">Include Vocabulary</label>
            </div>
             <div class="checkbox-item">
                <input type="checkbox" id="include_quiz" name="include_quiz" .checked=${this._formData.include_quiz} @change=${this._handleInputChange} ?disabled=${this.isSubmitting}>
                <label for="include_quiz">Include Quiz</label>
            </div>
        </div>

        <!-- Additional Instructions -->
        <div class="form-group full-width">
          <label for="user_prompt_addition">Additional Instructions (Optional)</label>
          <textarea id="user_prompt_addition" name="user_prompt_addition" .value=${this._formData.user_prompt_addition} @input=${this._handleInputChange} placeholder="e.g., Focus on the practical applications..." ?disabled=${this.isSubmitting}></textarea>
        </div>

        <!-- Submit Button -->
        <button type="submit" ?disabled=${this.isSubmitting}>
          ${this.isSubmitting ? 'Generating...' : 'Generate Lesson'}
        </button>
      </form>
    `;
  }
}

customElements.define('lesson-form', LessonForm); 