/**
 * Component Index - Exports all application components
 * 
 * This file exports both original and refactored components to support gradual
 * migration to the modular component architecture.
 */

// Load core dependencies first
import { LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Import components
import './toast-container.js';
import './loading-overlay.js';
import './error-boundary.js';
import './story-form.js';
import './story-content.js';
import './story-continuation.js';
import './stories-grid.js';
import './theme-toggle.js';

// Components for the form
import './form/form-settings-card.js';
import './form/form-input-group.js';
import './form/form-grid.js';
import './form/form-checkbox-options.js';
import './form/submit-button.js';

// Components for the story
import './story/story-header.js';
import './story/story-text.js';
import './story/story-summary.js';
import './story/story-vocabulary.js';
import './story/story-quiz.js';
import './story/story-result.js';
import './story/story-utilities.js';

// Components for the continuation
import './continuation/continuation-form.js';
import './continuation/continuation-result.js';
import './continuation/difficulty-selector.js';
import './continuation/difficulty-description.js';
import './continuation/vocabulary-display.js';
import './continuation/error-message.js';
import './continuation/focus-selector.js';

// Re-export components to make them globally available
export { StoryForm } from './story-form.js';
export { StoryContent } from './story-content.js';
export { StoryContinuation } from './story-continuation.js';
export { StoriesGrid } from './stories-grid.js';
export { ThemeToggle } from './theme-toggle.js';
export { StoryUtilities } from './story/story-utilities.js';

// Register global components map for dynamic component instantiation
window.components = {
  StoryForm: 'story-form',
  StoryContent: 'story-content',
  StoryContinuation: 'story-continuation',
  StoriesGrid: 'stories-grid',
  ThemeToggle: 'theme-toggle',
};

console.log('Component system initialized. Available components:', Object.keys(window.components));

// Component loading order configuration
const COMPONENT_LOAD_ORDER = {
  'loading-overlay': { path: './loading-overlay.js', loaded: false },
  'toast-container': { path: './toast-container.js', loaded: false },
  'story-form': { path: './story-form.js', loaded: false, priority: 'high' },
  'story-content': { path: './story-content.js', loaded: false },
  'story-display': { path: './story-display.js', loaded: false },
  'story-continuation': { path: './story-continuation.js', loaded: false },
  'stories-grid': { path: './stories-grid.js', loaded: false },
  'quiz-component': { path: './quiz-component.js', loaded: false }
};

// Utility function to load components
async function loadComponent(name) {
  if (COMPONENT_LOAD_ORDER[name]?.loaded) {
    return;
  }

  try {
    // Mark component as loaded
    if (COMPONENT_LOAD_ORDER[name]) {
      COMPONENT_LOAD_ORDER[name].loaded = true;
    }

    // Find all instances of this component - both with data-component and direct tag name
    const dataAttrElements = document.querySelectorAll(`[data-component="${name}"]`);
    const directTagElements = document.querySelectorAll(name);
    
    // Combine both sets of elements
    const elements = [...Array.from(dataAttrElements), ...Array.from(directTagElements)];
    
    console.log(`Found ${elements.length} ${name} components (${dataAttrElements.length} with data-attribute, ${directTagElements.length} with direct tag)`);
    
    // For story-form, ensure it exists - create if not
    if (name === 'story-form' && elements.length === 0) {
      console.log(`No ${name} found, creating one in generator tab`);
      const generatorTab = document.getElementById('generator-tab');
      if (generatorTab) {
        const storyForm = document.createElement('story-form');
        generatorTab.insertBefore(storyForm, generatorTab.firstChild);
        
        // Wrap with error boundary
        if (!storyForm.closest('error-boundary')) {
          const errorBoundary = document.createElement('error-boundary');
          storyForm.parentNode.insertBefore(errorBoundary, storyForm);
          errorBoundary.appendChild(storyForm);
        }
      }
    }
    
    // Wrap each component with error boundary
    elements.forEach(element => {
      if (!element.closest('error-boundary')) {
        const errorBoundary = document.createElement('error-boundary');
        element.parentNode.insertBefore(errorBoundary, element);
        errorBoundary.appendChild(element);
      }
    });

  } catch (error) {
    console.error(`Error loading component ${name}:`, error);
    // Show error in the component's place - look for both types of elements
    const elements = document.querySelectorAll(`[data-component="${name}"], ${name}`);
    elements.forEach(element => {
      const errorBoundary = document.createElement('error-boundary');
      errorBoundary.setAttribute('data-error', error.message);
      element.parentNode.insertBefore(errorBoundary, element);
      errorBoundary.appendChild(element);
    });
  }
}

// Initialize components
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Create global error boundary for the entire app
    const appContainer = document.querySelector('#app');
    if (appContainer && !appContainer.closest('error-boundary')) {
      const rootErrorBoundary = document.createElement('error-boundary');
      appContainer.parentNode.insertBefore(rootErrorBoundary, appContainer);
      rootErrorBoundary.appendChild(appContainer);
    }

    // First, ensure high priority components are loaded
    for (const [name, config] of Object.entries(COMPONENT_LOAD_ORDER)) {
      if (config.priority === 'high') {
        await loadComponent(name);
      }
    }

    // Then load the rest of the components
    for (const [name, config] of Object.entries(COMPONENT_LOAD_ORDER)) {
      if (config.priority !== 'high') {
        await loadComponent(name);
      }
    }

    // Force a check after a short delay to ensure components are there
    setTimeout(() => {
      // Extra check for story-form
      if (!document.querySelector('story-form')) {
        console.warn('story-form still not found after initialization, forcing creation');
        const generatorTab = document.getElementById('generator-tab');
        if (generatorTab) {
          const storyForm = document.createElement('story-form');
          generatorTab.insertBefore(storyForm, generatorTab.firstChild);
        }
      }
    }, 500);

    // Initialize error reporting
    if (window.ENV_ERROR_REPORTING?.ENABLED) {
      console.log('Error reporting initialized');
    }

    // Add a debug function to log registered web components
    console.log('Loading EasyStory components...');

    // Check if custom elements are properly defined
    const componentDefinitions = {
      'story-continuation': 'StoryContinuation',
      'continuation-form': 'ContinuationForm',
      'difficulty-selector': 'DifficultySelector',
      'difficulty-description': 'DifficultyDescription',
      'story-content': 'StoryContent',
      'story-form': 'StoryForm'
    };

    Object.entries(componentDefinitions).forEach(([tag, className]) => {
      if (!customElements.get(tag)) {
        console.error(`Critical: Custom element <${tag}> is not registered. UI may fail to display properly.`);
      }
    });

    // Add a function to help check if components are registered
    window.checkComponentRegistration = function() {
      console.log('Checking component registration:');
      console.log('story-continuation registered:', !!customElements.get('story-continuation'));
      console.log('continuation-form registered:', !!customElements.get('continuation-form'));
      console.log('difficulty-selector registered:', !!customElements.get('difficulty-selector'));
      console.log('difficulty-description registered:', !!customElements.get('difficulty-description'));
      console.log('story-form registered:', !!customElements.get('story-form'));
      
      // Check if component is in DOM
      const storyForm = document.querySelector('story-form');
      console.log('story-form in DOM:', !!storyForm);
      if (storyForm) {
        console.log('story-form rendered:', storyForm.shadowRoot?.querySelector('.form-section') !== null);
      }
      
      // Check if continuation container exists
      const contContainer = document.getElementById('continuation-container');
      console.log('continuation-container exists:', !!contContainer);
      if (contContainer) {
        console.log('continuation-container contents:', contContainer.innerHTML);
      }
      
      // Check if story continuation container exists
      const storyContComponent = document.getElementById('storyContinuationContainer');
      console.log('storyContinuationContainer exists:', !!storyContComponent);
      if (storyContComponent) {
        console.log('storyContinuationContainer tagName:', storyContComponent.tagName);
      }
    };

    // Call the check function after a small delay to ensure components are loaded
    setTimeout(() => {
      window.checkComponentRegistration();
    }, 1000);

  } catch (error) {
    console.error('Error initializing application:', error);
    // Show error in the app container
    const appContainer = document.querySelector('#app');
    if (appContainer) {
      const errorBoundary = document.createElement('error-boundary');
      errorBoundary.setAttribute('data-error', error.message);
      appContainer.parentNode.insertBefore(errorBoundary, appContainer);
      errorBoundary.appendChild(appContainer);
    }
  }
}); 