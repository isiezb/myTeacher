/**
 * Component Loader Utility
 * 
 * This utility helps manage the transition between original and refactored components
 * by providing a way to select which version to use.
 */

// DO NOT import components directly here to avoid double registration
// Components are now imported via HTML scripts in the correct order

// Configuration flag to enable refactored components
const USE_REFACTORED_COMPONENTS = true;

/**
 * Check if a custom element is already defined
 */
function isElementDefined(tagName) {
  return !!customElements.get(tagName);
}

/**
 * Initialize the appropriate components based on configuration
 */
export function initializeComponents() {
  console.log('🔄 Initializing components...');
  
  const storyFormContainers = document.querySelectorAll('[data-component="story-form"]');
  const storyContentContainers = document.querySelectorAll('[data-component="story-content"]');
  const storyContinuationContainers = document.querySelectorAll('[data-component="story-continuation"]');
  const storiesGridContainers = document.querySelectorAll('[data-component="stories-grid"]');
  
  if (USE_REFACTORED_COMPONENTS) {
    // Replace with refactored components
    const formTag = 'story-form-refactored';
    const contentTag = 'story-content-refactored';
    const continuationTag = 'story-continuation-refactored';
    const gridTag = 'stories-grid-refactored';
    
    // Only create components if they're defined
    if (isElementDefined(formTag)) {
      storyFormContainers.forEach(container => initializeComponent(container, formTag));
    } else {
      console.warn(`⚠️ Component ${formTag} is not defined`);
    }
    
    if (isElementDefined(contentTag)) {
      storyContentContainers.forEach(container => initializeComponent(container, contentTag));
    } else {
      console.warn(`⚠️ Component ${contentTag} is not defined`);
    }
    
    if (isElementDefined(continuationTag)) {
      storyContinuationContainers.forEach(container => initializeComponent(container, continuationTag));
    } else {
      console.warn(`⚠️ Component ${continuationTag} is not defined`);
    }
    
    if (isElementDefined(gridTag)) {
      storiesGridContainers.forEach(container => initializeComponent(container, gridTag));
    } else {
      console.warn(`⚠️ Component ${gridTag} is not defined`);
    }
  } else {
    // Use original components
    const formTag = 'story-form';
    const contentTag = 'story-content';
    const continuationTag = 'story-continuation';
    const gridTag = 'stories-grid';
    
    // Only create components if they're defined
    if (isElementDefined(formTag)) {
      storyFormContainers.forEach(container => initializeComponent(container, formTag));
    } else {
      console.warn(`⚠️ Component ${formTag} is not defined`);
    }
    
    if (isElementDefined(contentTag)) {
      storyContentContainers.forEach(container => initializeComponent(container, contentTag));
    } else {
      console.warn(`⚠️ Component ${contentTag} is not defined`);
    }
    
    if (isElementDefined(continuationTag)) {
      storyContinuationContainers.forEach(container => initializeComponent(container, continuationTag));
    } else {
      console.warn(`⚠️ Component ${continuationTag} is not defined`);
    }
    
    if (isElementDefined(gridTag)) {
      storiesGridContainers.forEach(container => initializeComponent(container, gridTag));
    } else {
      console.warn(`⚠️ Component ${gridTag} is not defined`);
    }
  }
  
  console.log('✅ Components initialized successfully');
}

/**
 * Initialize a single component in a container
 */
function initializeComponent(container, tagName) {
  try {
    const component = document.createElement(tagName);
    
    // Copy any attributes from the container to the component
    Array.from(container.attributes).forEach(attr => {
      if (attr.name !== 'data-component') {
        component.setAttribute(attr.name, attr.value);
      }
    });
    
    // Clear the container and append the new component
    container.innerHTML = '';
    container.appendChild(component);
  } catch (error) {
    console.error(`❌ Error initializing ${tagName}:`, error);
  }
}

// Auto-initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeComponents);

// Export individual components for direct usage
export const components = {
  StoryForm: USE_REFACTORED_COMPONENTS ? 'story-form-refactored' : 'story-form',
  StoryContent: USE_REFACTORED_COMPONENTS ? 'story-content-refactored' : 'story-content',
  StoryContinuation: USE_REFACTORED_COMPONENTS ? 'story-continuation-refactored' : 'story-continuation',
  StoriesGrid: USE_REFACTORED_COMPONENTS ? 'stories-grid-refactored' : 'stories-grid'
};