import './styles.css'; // Import global styles
import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js'; // Import state decorator

// Import components
import './components/lesson-form.js';
import './components/lesson-display.js'; // Import the new display component
import './components/display/lesson-vocabulary.js'; // Ensure sub-components are loaded if not bundled
import './components/display/lesson-summary.js';
import './components/display/lesson-quiz.js';
import './components/lesson-continuation.js'; // Import the new component
// TODO: Import lesson-display component later

// Define the main application component
class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem; /* Reduced padding */
      max-width: 900px;
      margin: 1rem auto; /* Reduced margin */
    }
    .content-area {
        margin-top: 2rem;
        min-height: 200px; /* Give it some height */
        /* Styles for where the generated lesson will appear */
    }
     .loading, .error {
        text-align: center;
        padding: 2rem;
        font-style: italic;
        color: #555;
        background-color: #f9f9f9;
        border: 1px dashed #ccc;
        border-radius: 8px;
    }
    .error {
        color: #c0392b; /* Error color */
        font-weight: bold;
        background-color: #fdecea;
        border-color: #e74c3c;
    }
     .placeholder-text {
         text-align: center;
         padding: 2rem;
         color: #777;
     }
  `;

  // Reactive properties using @state decorator
  @state() _lesson = null; // Renamed from _generatedLesson for clarity
  @state() _isLoading = false;
  @state() _error = null;
  @state() _showContinuationForm = false;
  @state() _lessonToContinue = null;

  async _handleGenerateRequest(event) {
    const formData = event.detail;
    console.log('Received generate-lesson-request:', formData);

    this._isLoading = true;
    this._error = null;
    this._lesson = null; // Clear previous lesson
    this._showContinuationForm = false; // Hide continuation form on new generation
    this._lessonToContinue = null;

    try {
      // Use environment variable for API URL or default (Vite specific)
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/lessons/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (e) { /* Ignore if error response isn't JSON */}
        throw new Error(errorDetail);
      }

      this._lesson = await response.json();
      console.log("Lesson generated:", this._lesson);

    } catch (error) {
      console.error("Failed to generate lesson:", error);
      this._error = `Failed to generate lesson: ${error.message}`;
      this._lesson = null;
    } finally {
      this._isLoading = false;
    }
  }

  // Handle request to show the continuation form
  _handleRequestContinue(event) {
    this._lessonToContinue = event.detail.lessonData;
    this._showContinuationForm = true;
    console.log("Continue requested for:", this._lessonToContinue?.id);
  }

  // Handle submission of the continuation prompt
  async _handleContinuationSubmit(event) {
      const continuationPrompt = event.detail.prompt;
      if (!this._lessonToContinue) {
          console.error("No lesson selected for continuation.");
          this._error = "Cannot continue: No previous lesson found.";
          return;
      }

      this._isLoading = true;
      this._error = null;
      this._showContinuationForm = false; // Hide form while loading

      // Prepare payload for the backend /continue endpoint
      // Send relevant previous lesson details and the new prompt/settings
      const payload = {
          original_lesson_id: this._lessonToContinue.id,
          original_lesson_content: this._lessonToContinue.lesson_content,
          // Add other necessary fields based on backend model, e.g.:
          // word_count: 200, // Or get from continuation form
          // difficulty_adjustment: 'same', // Or get from continuation form
          // focus_topic: continuationPrompt, // Or parse from prompt
          user_prompt_addition: continuationPrompt, // Sending raw prompt for now
          // Include flags based on original lesson or continuation form
          include_summary: this._lessonToContinue.summary !== null,
          include_vocabulary: this._lessonToContinue.vocabulary !== null,
          include_quiz: this._lessonToContinue.quiz !== null,
      };

      try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
          const lessonId = this._lessonToContinue.id;
          const response = await fetch(`${apiUrl}/lessons/${lessonId}/continue`, { // Use the correct endpoint
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify(payload),
          });

          if (!response.ok) {
              let errorDetail = `HTTP error! status: ${response.status}`;
              try {
                  const errorData = await response.json();
                  errorDetail = errorData.detail || errorDetail;
              } catch (e) { /* Ignore */}
              throw new Error(errorDetail);
          }

          const continuationData = await response.json();
          console.log("Lesson continued:", continuationData);

          // --- Append continuation data to the existing lesson --- 
          // Create a *new* lesson object to ensure reactivity
          const updatedLesson = { ...this._lesson }; 

          // Append content (add a separator)
          updatedLesson.lesson_content += `\n\n--- Continuation ---\n\n${continuationData.continuation_content}`;

          // Update word count (approximate)
          updatedLesson.word_count = (updatedLesson.word_count || 0) + (continuationData.word_count || 0);

          // Append vocabulary (avoiding duplicates? simple append for now)
          if (continuationData.vocabulary) {
              updatedLesson.vocabulary = [...(updatedLesson.vocabulary || []), ...continuationData.vocabulary];
          }

           // Append quiz questions
          if (continuationData.quiz) {
              updatedLesson.quiz = [...(updatedLesson.quiz || []), ...continuationData.quiz];
          }

          // Update summary (replace or append? Replace for now)
          if (continuationData.summary) {
              // Decide strategy: replace, append, or ignore new summary?
              // Replacing the main summary with the continuation summary might be confusing.
              // Maybe display continuation summary separately? For now, just log it.
              console.log("Continuation summary:", continuationData.summary);
              // Or maybe append: updatedLesson.summary = (updatedLesson.summary || "") + "\n\nContinuation Summary: " + continuationData.summary;
          }

          this._lesson = updatedLesson; // Assign the new object to trigger update
          // --- End Append Logic --- 
          
          this._lessonToContinue = null; // Clear the lesson-to-continue state

      } catch (error) {
          console.error("Failed to continue lesson:", error);
          this._error = `Failed to continue lesson: ${error.message}`;
          // Keep showing continuation form on error?
          this._showContinuationForm = true; 
      } finally {
          this._isLoading = false;
      }
  }

  render() {
    return html`
      <lesson-form
        ?isSubmitting=${this._isLoading}
        @generate-lesson-request=${this._handleGenerateRequest}
      ></lesson-form>

      <div class="content-area">
        ${this._isLoading ? html`<div class="loading">Generating lesson... Please wait.</div>` : ''}
        ${this._error ? html`<div class="error">Error: ${this._error}</div>` : ''}

        ${this._lesson
          ? html`<lesson-display .lessonData=${this._lesson} @continue-lesson=${this._handleRequestContinue}></lesson-display>`
          : !this._isLoading ? html`<div class="placeholder-text">Generated lesson will appear here.</div>` : ''
        }

        ${this._showContinuationForm && this._lesson ? html`
          <lesson-continuation
            @submit-continuation=${this._handleContinuationSubmit}>
          </lesson-continuation>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('app-root', AppRoot);

// Replace placeholder content in index.html
const appContainer = document.getElementById('app');
if (appContainer) {
    appContainer.innerHTML = ''; // Clear placeholder
    const appRoot = document.createElement('app-root');
    appContainer.appendChild(appRoot);
} else {
    console.error("Could not find #app container in index.html");
}

console.log('EasyLesson frontend initialized with AppRoot.');
