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

    // Find all instances of this component
    const elements = document.querySelectorAll(`[data-component="${name}"]`);
    
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
    // Show error in the component's place
    const elements = document.querySelectorAll(`[data-component="${name}"]`);
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