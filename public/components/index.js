/**
 * Component Index - Exports all application components
 * 
 * This file exports both original and refactored components to support gradual
 * migration to the modular component architecture.
 */

// Original components  
import '/components/toast-container.js';
import '/components/loading-overlay.js';
import '/components/story-form.js';
import '/components/story-content.js';
import '/components/story-continuation.js';
import '/components/stories-grid.js';
import '/components/quiz-component.js';

// Refactored components
import '/components/story-form-refactored.js';
// import '/components/story-content-refactored.js'; // Removed - Loaded via index.html
import '/components/story-continuation-refactored.js';

// Form components
import '/components/form/form-settings-card.js';
import '/components/form/form-input-group.js';
import '/components/form/form-grid.js';
import '/components/form/form-checkbox-options.js';
import '/components/form/submit-button.js';

// Story components
import '/components/story/story-header.js';
import '/components/story/story-text.js';
import '/components/story/story-summary.js';
import '/components/story/story-vocabulary.js';
import '/components/story/story-quiz.js';

// Continuation components
import '/components/continuation/difficulty-selector.js';
import '/components/continuation/difficulty-description.js';
import '/components/continuation/vocabulary-display.js';
import '/components/continuation/continuation-form.js';
import '/components/continuation/continuation-result.js';
import '/components/continuation/error-message.js';

// Re-export components for external use
export * from './story-form.js';
export * from './story-content.js';
export * from './story-continuation.js';
export * from './story-form-refactored.js';
export * from './story-continuation-refactored.js'; 