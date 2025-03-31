/**
 * Component Loader Utility
 * 
 * This utility helps manage the transition between original and refactored components
 * by providing a way to select which version to use.
 */

// Import original components
import '../components/story-form.js';
import '../components/story-content.js';
import '../components/story-continuation.js';
// Import refactored components
import '../components/story-form-refactored.js';
import '../components/story-content-refactored.js';
import '../components/story-continuation-refactored.js';

// Configuration flag to enable refactored components
const USE_REFACTORED_COMPONENTS = true;

/**
 * Initialize the appropriate components based on configuration
 */
export function initializeComponents() {
  const storyFormContainers = document.querySelectorAll('[data-component="story-form"]');
  const storyContentContainers = document.querySelectorAll('[data-component="story-content"]');
  const storyContinuationContainers = document.querySelectorAll('[data-component="story-continuation"]');
  
  if (USE_REFACTORED_COMPONENTS) {
    // Replace with refactored components
    storyFormContainers.forEach(container => {
      const storyForm = document.createElement('story-form-refactored');
      // Copy any attributes from the container to the component
      Array.from(container.attributes).forEach(attr => {
        if (attr.name !== 'data-component') {
          storyForm.setAttribute(attr.name, attr.value);
        }
      });
      // Clear the container and append the new component
      container.innerHTML = '';
      container.appendChild(storyForm);
    });
    
    storyContentContainers.forEach(container => {
      const storyContent = document.createElement('story-content-refactored');
      // Copy any attributes from the container to the component
      Array.from(container.attributes).forEach(attr => {
        if (attr.name !== 'data-component') {
          storyContent.setAttribute(attr.name, attr.value);
        }
      });
      // Clear the container and append the new component
      container.innerHTML = '';
      container.appendChild(storyContent);
    });
    
    storyContinuationContainers.forEach(container => {
      const storyContinuation = document.createElement('story-continuation-refactored');
      // Copy any attributes from the container to the component
      Array.from(container.attributes).forEach(attr => {
        if (attr.name !== 'data-component') {
          storyContinuation.setAttribute(attr.name, attr.value);
        }
      });
      // Clear the container and append the new component
      container.innerHTML = '';
      container.appendChild(storyContinuation);
    });
  } else {
    // Use original components
    storyFormContainers.forEach(container => {
      const storyForm = document.createElement('story-form');
      // Copy any attributes from the container to the component
      Array.from(container.attributes).forEach(attr => {
        if (attr.name !== 'data-component') {
          storyForm.setAttribute(attr.name, attr.value);
        }
      });
      // Clear the container and append the new component
      container.innerHTML = '';
      container.appendChild(storyForm);
    });
    
    storyContentContainers.forEach(container => {
      const storyContent = document.createElement('story-content');
      // Copy any attributes from the container to the component
      Array.from(container.attributes).forEach(attr => {
        if (attr.name !== 'data-component') {
          storyContent.setAttribute(attr.name, attr.value);
        }
      });
      // Clear the container and append the new component
      container.innerHTML = '';
      container.appendChild(storyContent);
    });
    
    storyContinuationContainers.forEach(container => {
      const storyContinuation = document.createElement('story-continuation');
      // Copy any attributes from the container to the component
      Array.from(container.attributes).forEach(attr => {
        if (attr.name !== 'data-component') {
          storyContinuation.setAttribute(attr.name, attr.value);
        }
      });
      // Clear the container and append the new component
      container.innerHTML = '';
      container.appendChild(storyContinuation);
    });
  }
}

// Auto-initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeComponents);

// Export individual components for direct usage
export const components = {
  StoryForm: USE_REFACTORED_COMPONENTS ? 'story-form-refactored' : 'story-form',
  StoryContent: USE_REFACTORED_COMPONENTS ? 'story-content-refactored' : 'story-content',
  StoryContinuation: USE_REFACTORED_COMPONENTS ? 'story-continuation-refactored' : 'story-continuation'
};