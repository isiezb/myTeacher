/**
 * Component Index - Exports all application components
 * 
 * This file exports both original and refactored components to support gradual
 * migration to the modular component architecture.
 */

// Load core dependencies first
import { LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Utility function to ensure component is only loaded once
const loadComponent = async (path) => {
  const tagName = path.split('/').pop().replace('.js', '');
  if (!customElements.get(tagName)) {
    try {
      await import(path);
      console.log(`✅ Loaded component: ${tagName}`);
    } catch (error) {
      console.error(`❌ Failed to load component ${tagName}:`, error);
    }
  } else {
    console.log(`⚠️ Component ${tagName} already registered, skipping load`);
  }
};

// Get configuration
const config = window.componentConfig || {
  LOAD_ORDER: []
};

// Load components in order
async function loadComponents() {
  console.log('🔄 Loading components in order...');
  
  // Load base components and sub-components first
  for (const path of config.LOAD_ORDER) {
    await loadComponent(path);
  }
  
  // Load main components
  console.log('Loading main components');
  await Promise.all([
    loadComponent('/components/story-form.js'),
    loadComponent('/components/story-content.js'),
    loadComponent('/components/story-continuation.js'),
    loadComponent('/components/stories-grid.js'),
    loadComponent('/components/quiz-component.js'),
    loadComponent('/components/story-display.js'),
    loadComponent('/components/story-card.js')
  ]);
  
  // Dispatch event when all components are loaded
  window.dispatchEvent(new CustomEvent('components-loaded'));
}

// Start loading components
loadComponents().catch(error => {
  console.error('Failed to load components:', error);
}); 