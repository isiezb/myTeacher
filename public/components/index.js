/**
 * Component Index - Exports all application components
 * 
 * This file exports both original and refactored components to support gradual
 * migration to the modular component architecture.
 */

// Load core dependencies first
import { LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Import components
import './error-boundary.js';
import './story-form.js';
import './story-content.js';
import './story-display.js';
import './story-continuation.js';
import './stories-grid.js';
import './quiz-component.js';
import './loading-overlay.js';
import './toast-container.js';

// Component loading order configuration
const COMPONENT_LOAD_ORDER = {
  'loading-overlay': { path: './loading-overlay.js', loaded: false },
  'toast-container': { path: './toast-container.js', loaded: false },
  'story-form': { path: './story-form.js', loaded: false },
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

    // Load components in order
    for (const [name, config] of Object.entries(COMPONENT_LOAD_ORDER)) {
      await loadComponent(name);
    }

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