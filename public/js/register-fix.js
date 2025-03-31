/**
 * Component Registration Fix Script
 * 
 * This script attempts to fix components that failed to register properly.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Running component registration check...');
  
  // Add a slight delay to allow regular registration to occur first
  setTimeout(() => {
    // Check components that we know should be defined
    const componentsToCheck = [
      'story-display',
      'story-card',
      'story-form',
      'story-content',
      'stories-grid',
      'quiz-component',
      'story-continuation',
      // Also check refactored versions if relevant
      'story-display-refactored',
      'story-card-refactored',
      'story-form-refactored',
      'story-content-refactored',
      'stories-grid-refactored',
      'quiz-component-refactored',
      'story-continuation-refactored'
    ];
    
    console.log('--- Component Registration Check Results ---');
    componentsToCheck.forEach(componentName => {
      if (!customElements.get(componentName)) {
        console.warn(`⚠️ Component ${componentName} was not defined after delay.`);
      } else {
        // Optional: Log success for clarity during debugging
        // console.log(`✅ Component ${componentName} is defined.`);
      }
    });
    console.log('--- End Component Registration Check ---');

    // REMOVED: Fallback definition logic
    /* 
    const missingComponents = [
      {
        name: 'story-display',
        path: 'components/story-display.js',
        fallback: true // Keep configuration for potential future use
      }
    ];
    
    missingComponents.forEach(async (component) => {
      if (!customElements.get(component.name)) { 
        // ... fallback logic was here ...
      }
    });
    */
    
    // REMOVED: Manual creation in empty containers logic
    /*
    const componentContainers = document.querySelectorAll('[data-component]');
    console.log(`Found ${componentContainers.length} component containers`);
    componentContainers.forEach(container => {
      // ... manual creation logic was here ...
    });
    */

  }, 2500); // Increased delay slightly to 2.5 seconds
}); 