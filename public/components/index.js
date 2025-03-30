/**
 * Main entry point for all Lit components
 * This file imports all components and registers them to be globally available
 */

// Import from CDN instead of local module imports
import { html, render } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Log initialization
console.log('Initializing Lit components from CDN...');

// Import directly to ensure they're loaded first
import './toast-container.js';
import './loading-overlay.js';
import './story-form.js';
import './story-display.js';

// Utility to check if a component is defined
const isComponentDefined = (name) => {
  return customElements.get(name) !== undefined;
};

// Import all components - this acts as a fallback
const importComponent = async (componentName) => {
  try {
    // Skip if already defined
    if (isComponentDefined(componentName)) {
      console.log(`Component ${componentName} already defined, skipping import`);
      return;
    }
    
    console.log(`Importing component: ${componentName}`);
    
    // Try different paths
    await import(`./${componentName}.js`)
      .catch(() => import(`/components/${componentName}.js`))
      .catch(() => import(`/public/components/${componentName}.js`))
      .catch(err => {
        console.warn(`Failed to load component ${componentName}:`, err.message);
        // Last attempt with absolute path
        return import(`https://easystory.onrender.com/components/${componentName}.js`);
      });
      
    if (isComponentDefined(componentName)) {
      console.log(`Component ${componentName} loaded successfully`);
    } else {
      console.error(`Component ${componentName} not defined after import`);
    }
  } catch (err) {
    console.error(`Could not load component ${componentName}:`, err);
  }
};

// List of all components to load
const components = [
  'toast-container',
  'loading-overlay',
  'story-card',
  'stories-grid', 
  'story-display',
  'quiz-component',
  'story-form',
  'story-continuation',
  'story-content'
];

// Load all components
Promise.all(components.map(component => importComponent(component)))
  .then(() => {
    console.log('All components loaded');
    // Signal that components are ready
    window.litComponentsReady = true;
    // Dispatch event for app to know components are ready
    window.dispatchEvent(new CustomEvent('lit-components-ready'));
    
    // Log which components are defined
    components.forEach(component => {
      console.log(`Component ${component} defined: ${isComponentDefined(component)}`);
    });
  })
  .catch(err => {
    console.error('Error loading components:', err);
  });

export { html, render }; 