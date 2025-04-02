import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

export class LessonContinuation extends LitElement {
    @state() _continuationPrompt = '';

    static styles = css`
        :host {
            display: block;
            padding: 1.5rem;
            background-color: #f8f9fa; /* Slightly different background */
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-top: 1rem;
        }
        h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: #495057;
        }
        textarea {
            width: 100%;
            min-height: 80px;
            padding: 0.75rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            box-sizing: border-box; /* Include padding in width */
        }
        button {
            display: inline-block;
            padding: 0.6rem 1.2rem;
            background-color: var(--primary-color, #4a63b9);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        button:hover {
            background-color: var(--primary-hover-color, #3a51a0);
        }
         button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
    `;

    _handleSubmit(event) {
        event.preventDefault();
        if (!this._continuationPrompt.trim()) return; // Prevent empty submissions

        const continuationEvent = new CustomEvent('submit-continuation', {
            detail: { prompt: this._continuationPrompt },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(continuationEvent);
    }

    _handleInput(event) {
        this._continuationPrompt = event.target.value;
    }

    render() {
        return html`
            <h3>Continue Lesson</h3>
            <form @submit=${this._handleSubmit}>
                <textarea
                    placeholder="How should the lesson continue? (e.g., 'Explain the first topic in more detail', 'Add a quiz question about...', 'Make the summary shorter')"
                    .value=${this._continuationPrompt}
                    @input=${this._handleInput}
                    required
                ></textarea>
                <button type="submit" ?disabled=${!this._continuationPrompt.trim()}>
                    Generate Continuation
                </button>
            </form>
        `;
    }
}

customElements.define('lesson-continuation', LessonContinuation); 