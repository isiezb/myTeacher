/**
 * Component Index - Exports all application components
 * 
 * This file exports both original and refactored components to support gradual
 * migration to the modular component architecture.
 */

// Original components  
import './toast-container.js';
import './loading-overlay.js';
import './story-form.js';
import './story-content.js';
import './story-continuation.js';
import './stories-grid.js';
import './quiz-component.js';

// Refactored components
import './story-form-refactored.js';
import './story-content-refactored.js';
import './story-continuation-refactored.js';

// Form components
import './form/form-settings-card.js';
import './form/form-input-group.js';
import './form/form-grid.js';
import './form/form-checkbox-options.js';
import './form/submit-button.js';

// Story components
import './story/story-header.js';
import './story/story-text.js';
import './story/story-summary.js';
import './story/story-vocabulary.js';
import './story/story-quiz.js';

// Continuation components
import './continuation/difficulty-selector.js';
import './continuation/difficulty-description.js';
import './continuation/vocabulary-display.js';
import './continuation/continuation-form.js';
import './continuation/continuation-result.js';
import './continuation/error-message.js';

// Re-export components for external use
export * from './story-form.js';
export * from './story-content.js';
export * from './story-continuation.js';
export * from './story-form-refactored.js';
export * from './story-content-refactored.js';
export * from './story-continuation-refactored.js'; 