/**
 * Component Debug Utility
 * 
 * This script helps diagnose component loading issues by checking
 * the state of component definitions and script loading.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 Component Debug Tool Starting...');
  
  // Check if scripts are properly loaded
  const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
  console.log(`📜 Found ${scripts.length} module scripts:`);
  
  scripts.forEach((script, index) => {
    const src = script.src || 'inline';
    console.log(`  ${index + 1}. ${src}`);
    
    // Add error handler to catch script loading issues
    script.addEventListener('error', (e) => {
      console.error(`❌ Failed to load script: ${src}`, e);
    });
  });
  
  // Check component definitions
  const components = [
    'toast-container',
    'loading-overlay',
    'story-form',
    'story-display',
    'story-content',
    'stories-grid',
    'story-card',
    'quiz-component',
    'story-continuation',
    'story-display-refactored',
    'story-card-refactored'
  ];
  
  console.log('🧩 Component Definition Status:');
  components.forEach(component => {
    const isDefined = customElements.get(component) !== undefined;
    console.log(`  ${isDefined ? '✅' : '❌'} ${component}: ${isDefined ? 'Defined' : 'Not Defined'}`);
  });
  
  // Add manual registration check for story-display
  setTimeout(() => {
    try {
      // Try to manually register the component to see if there are any errors
      if (!customElements.get('story-display')) {
        console.log('⚠️ Attempting manual registration check for story-display...');
        // We're not actually registering - just checking if it would throw an error
        const StoryDisplay = window.StoryDisplay;
        if (typeof StoryDisplay === 'undefined') {
          console.error('❌ StoryDisplay class is not available in global scope');
        } else {
          console.log('✅ StoryDisplay class is available but not registered');
        }
      }
    } catch (err) {
      console.error('❌ Error during manual registration check:', err);
    }
    
    // Check for DOM elements
    const storyDisplayContainers = document.querySelectorAll('[data-component="story-display"]');
    console.log(`🏞️ Found ${storyDisplayContainers.length} story-display containers`);
    
    if (storyDisplayContainers.length > 0) {
      console.log('📍 Container details:');
      storyDisplayContainers.forEach((container, i) => {
        console.log(`  Container ${i + 1}:`, {
          innerHTML: container.innerHTML.substring(0, 100) + '...',
          children: container.children.length,
          attributes: Array.from(container.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
        });
      });
    }
  }, 1000);
}); 