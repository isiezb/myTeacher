/**
 * Main application script
 */

// Initialize the application
(function initApp() {
  // Add global event listeners
  document.addEventListener('DOMContentLoaded', onDocumentReady);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Track component initialization
  const componentStatus = {
    'story-form': false,
    'story-content': false,
    'story-continuation': false,
    'quiz-component': false,
    'stories-grid': false,
    'toast-container': false,
    'loading-overlay': false
  };

  // On DOM ready
  async function onDocumentReady() {
    console.log('DOM content loaded');
    
    try {
      // Initialize error boundary for the app container
      await initializeErrorBoundary();
      
      // Set up core components
      await setupComponents();
      
      // Set up event listeners
      setupEventListeners();

      // Initialize Supabase
      await initializeSupabase();

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error during app initialization:', error);
      window.showToast?.('Error initializing application', 'error');
    }
  }

  // Initialize error boundary
  async function initializeErrorBoundary() {
    const appContainer = document.getElementById('app');
    if (appContainer && !appContainer.closest('error-boundary')) {
      const errorBoundary = document.createElement('error-boundary');
      appContainer.parentNode.insertBefore(errorBoundary, appContainer);
      errorBoundary.appendChild(appContainer);
    }
  }

  // Initialize Supabase
  async function initializeSupabase() {
    try {
      if (window.initSupabase && typeof window.initSupabase === 'function') {
        await window.initSupabase();
        await checkUserSession();
      } else {
        console.warn('Supabase not initialized, skipping user session check');
      }
    } catch (err) {
      console.error('Error during authentication setup:', err);
      if (!window.ENV_MOCK_MODE) {
        window.showToast?.('Error connecting to database', 'error');
      }
    }
  }

  // Check user session
  async function checkUserSession() {
    if (window.supabase?.auth) {
      // Set up auth state change listener
      window.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session.user.email);
          updateUIForAuthenticatedUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          updateUIForAnonymousUser();
        }
      });

      // Get initial session
      const { data: { session } } = await window.supabase.auth.getSession();
      if (session) {
        console.log('User is signed in:', session.user.email);
        updateUIForAuthenticatedUser(session.user);
      } else {
        console.log('No active session, user is anonymous');
        updateUIForAnonymousUser();
      }
    }
  }

  // Set up components
  async function setupComponents() {
    // Ensure core UI components exist
    ensureCoreComponents();
    
    // Set up story components
    await setupStoryComponents();
  }

  // Ensure core UI components exist
  function ensureCoreComponents() {
    // Add toast container if needed
    if (!document.querySelector('toast-container')) {
      const toastContainer = document.createElement('toast-container');
      toastContainer.setAttribute('position', 'top-right');
      document.body.appendChild(toastContainer);
      componentStatus['toast-container'] = true;
    }

    // Add loading overlay if needed
    if (!document.querySelector('loading-overlay')) {
      const loadingOverlay = document.createElement('loading-overlay');
      document.body.appendChild(loadingOverlay);
      componentStatus['loading-overlay'] = true;
    }
  }

  // Set up story components
  async function setupStoryComponents() {
    // Set up story form
    const generatorTab = document.getElementById('generator-tab');
    if (generatorTab) {
      // Look for direct tag first, then data-component
      let storyForm = generatorTab.querySelector('story-form');
      if (!storyForm) {
        storyForm = generatorTab.querySelector('[data-component="story-form"]');
      }
      
      // If not found, create it
      if (!storyForm) {
        console.log('Setting up story form');
        storyForm = document.createElement('story-form');
        generatorTab.insertBefore(storyForm, generatorTab.firstChild);
        componentStatus['story-form'] = true;
      }
    }

    // Set up story display
    const storyResult = document.getElementById('story-result');
    if (storyResult) {
      const storyContainer = storyResult.querySelector('#storyDisplayContainer');
      if (storyContainer) {
        // Create story content component if it doesn't exist
        // Try both ways of finding the component - direct tag or within container
        let storyContent = storyContainer.querySelector('story-content');
        if (!storyContent && storyContainer.tagName !== 'STORY-CONTENT') {
          console.log('Creating story content component');
          storyContent = document.createElement('story-content');
          storyContainer.appendChild(storyContent);
          componentStatus['story-content'] = true;
        } else if (storyContainer.tagName === 'STORY-CONTENT') {
          storyContent = storyContainer;
        }

        // Add story update listener - handle both scenarios
        const storyComponent = storyContent || storyContainer;
        if (storyComponent) {
          // Only add event listener if it doesn't already exist
          if (!storyComponent._hasUpdateListener) {
            storyComponent.addEventListener('story-updated', () => {
              storyResult.classList.remove('hidden');
            });
            storyComponent._hasUpdateListener = true;
            console.log('Added story-updated listener to story-content component');
          }
        }
      }
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Listen for story form submission
    document.addEventListener('story-form-submit', handleStoryFormSubmit);
    
    // Listen for continuation form request
    document.addEventListener('show-continuation-form', handleShowContinuationForm);
    
    // Listen for continue-story event from continuation-result
    document.addEventListener('continue-story', handleContinueStory);
  }

  // Handle form submission
  async function handleStoryFormSubmit(event) {
    const formData = event.detail.formData;
    console.log('Form data submitted:', formData);

    // Show loading indicator
    window.showLoading?.('Creating your educational story...');

    // Find the form component - either direct tag or data-component
    const formComponent = document.querySelector('story-form') || 
                          document.querySelector('[data-component="story-form"]');
    if (formComponent) {
      formComponent.isSubmitting = true;
    }

    try {
      // Call API to generate story
      const story = await generateStory(formData);

      // Save the story to window.currentStory for global access
      window.currentStory = story;
      console.log('Story saved to window.currentStory:', window.currentStory);

      // Find story content container and the component inside it
      const storyContainer = document.querySelector('#storyDisplayContainer'); // Use the correct container ID
      const storyComponentTag = window.components?.StoryContent || 'story-content'; // Get tag name dynamically
      
      if (storyContainer) {
        // Check if the container itself is the component or contains the component
        const storyComponent = storyContainer.tagName === storyComponentTag.toUpperCase() ?
                               storyContainer :
                               storyContainer.querySelector(storyComponentTag);
        
        if (storyComponent) {
          console.log(`Updating component <${storyComponentTag}>`, storyComponent.tagName);
          storyComponent.story = story;
          // Trigger custom event for story update
          storyComponent.dispatchEvent(new CustomEvent('story-updated', {
            bubbles: true,
            composed: true,
            detail: { story: story }
          }));
        } else {
           console.error(`Could not find component <${storyComponentTag}> inside or as #storyDisplayContainer`);
           window.showToast?.('Error updating display area.', 'error');
        }
      } else {
        console.error('Could not find story display container #storyDisplayContainer');
        window.showToast?.('Error finding display area.', 'error');
      }

      // Show the story result container if hidden
      const storyResult = document.getElementById('story-result');
      if (storyResult) {
        storyResult.classList.remove('hidden');
      }

      // Hide loading indicator before scrolling so the content is available
      window.hideLoading?.(() => {
        console.log('Loading overlay hidden, scrolling to content');
        
        // Scroll to the story content - try multiple possible selectors
        const scrollElements = [
          document.querySelector('.story-content-container .story-text p'),
          document.querySelector('story-text p'),
          document.querySelector('#storyDisplayContainer p'),
          document.querySelector('#story-result p')
        ];

        // Find the first valid element to scroll to
        let targetElement = null;
        for (const element of scrollElements) {
          if (element) {
            targetElement = element;
            break;
          }
        }

        // If no direct element found, try accessing elements in shadow DOM
        if (!targetElement) {
          const storyTextElement = document.querySelector('story-text');
          if (storyTextElement && storyTextElement.shadowRoot) {
            targetElement = storyTextElement.shadowRoot.querySelector('.story-text p');
          }
        }

        if (targetElement) {
          console.log('Scrolling to story content element:', targetElement);
          
          // Calculate the position to scroll to with proper header clearance
          const headerHeight = 80; // Adjust if needed based on your actual header height
          
          // Get the position of the element relative to the top of the document
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          
          // Subtract the header height to position it below the header
          const offsetPosition = elementPosition - headerHeight;
          
          // Scroll to the beginning of the story content
          window.scrollTo({
            top: offsetPosition,
            behavior: 'auto' // Use 'auto' instead of 'smooth' for more reliable scrolling
          });
          
          // Add a temporary highlight effect
          targetElement.classList.add('highlight-new-content');
          setTimeout(() => {
            targetElement.classList.remove('highlight-new-content');
          }, 2000);
        } else {
          console.warn('Could not find any valid story text element for scrolling');
          
          // Fallback: try to scroll to the story container
          const fallbackContainer = document.getElementById('story-result') || document.getElementById('storyDisplayContainer');
          if (fallbackContainer) {
            const containerPosition = fallbackContainer.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: containerPosition - 80, // Apply the same header offset
              behavior: 'auto'
            });
          }
        }
      });

      // Save the story to Supabase if storage is enabled
      if (window.ENV_ENABLE_STORAGE && typeof window.SupabaseService !== 'undefined') {
        try {
          window.showToast?.('Saving story to library...', 'info');
          const savedStory = await window.SupabaseService.saveStory(story);
          console.log('Story saved to database:', savedStory);
          
          // Update the story ID with the database ID if needed
          if (savedStory && savedStory.id && (!story.id || story.id.startsWith('mock'))) {
            story.id = savedStory.id;
            window.currentStory.id = savedStory.id;
            console.log('Updated story ID from database:', story.id);
          }
          
          window.showToast?.('Story saved to your library!', 'success');
        } catch (saveError) {
          console.error('Error saving story to database:', saveError);
          window.showToast?.('Failed to save story to library', 'warning');
        }
      }

      // Show success message
      window.showToast?.('Story generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating story:', error);
      window.showToast?.('Failed to generate story. Please try again.', 'error');
      
      // Hide loading indicator on error
      window.hideLoading?.();
    } finally {
      // Reset form submitting state
      if (formComponent) {
        formComponent.isSubmitting = false;
      }
    }
  }

  // Generate a story using form data
  async function generateStory(formData) {
    // Default API base URL from env.js
    // Empty string is valid and means use the current origin
    const baseUrl = window.ENV_API_URL; 

    console.log(`Using base URL (from env.js): '${baseUrl}'`);
    
    // Check if API service *function* exists before trying
    if (window.apiService && typeof window.apiService.generateStory === 'function') {
      console.log('Attempting direct API request...');
      try {
        const result = await window.apiService.generateStory(formData);
        console.log('Direct API request successful');
        return result;
      } catch (error) {
        console.error('Direct API service error:', error);
        
        // If this looks like a CORS or network error, try using proxy
        if (window.proxyService && 
            (error.message.includes('CORS') || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('Network') ||
             error.message.includes('TypeError'))) {
          
          console.log('Direct API failed (CORS/Network likely), trying proxy service...');
          // Fall through to proxy attempt below
        } else {
          // API failed for other reasons (e.g., 404, 500 from API itself)
          window.showToast?.('API error: ' + error.message, 'error');
          console.log('Direct API error (non-CORS/Network). Using mock story generation.');
          return mockGenerateStory(formData);
        }
      }
    } else {
        console.log('API service generateStory function not found.');
        // Fall through to proxy attempt if apiService itself exists but function doesn't
        // Or if apiService doesn't exist at all.
    }

    // Try proxy service if direct API failed or wasn't available
    if (window.proxyService && typeof window.proxyService.generateStory === 'function') {
      console.log('Attempting proxy service request...');
      try {
        const proxyResult = await window.proxyService.generateStory(baseUrl, formData);
        console.log('Proxy request successful (via app.js)');
        return proxyResult;
      } catch (proxyError) {
        console.error('Proxy service error:', proxyError);
        window.showToast?.('API Service Unavailable: Using mock data.', 'warning');
        console.log('Proxy failed. Using mock story generation.');
        return mockGenerateStory(formData);
      }
    } else {
      // No API or proxy service available
      console.log('No API or proxy service function available. Using mock data.');
      window.showToast?.('App Error: Services unavailable. Using mock data.', 'error');
      return mockGenerateStory(formData);
    }
  }
  
  // Mock story generation for testing
  function mockGenerateStory(formData) {
    // Mock response for testing
    console.log('Using mock story generation (no API service available)');
    
    // Simulating network delay
    return new Promise(resolve => setTimeout(() => {
      resolve({
        id: 'mock-story-' + Date.now(),
        title: `A Story About ${formData.subject}`,
        content: `Once upon a time in ${formData.setting || 'a magical land'}, there was ${formData.main_character || 'a curious student'} who loved learning about ${formData.subject}.\n\n` +
          `They discovered that ${formData.subject} was full of fascinating concepts. Every day they would study and learn more.\n\n` +
          `This is a placeholder story content that would normally be generated by the API based on the form data provided. It would be much longer (${formData.word_count} words) and focused on teaching ${formData.subject} to a ${formData.academic_grade} level student.\n\n` +
          `The story would incorporate educational elements while being engaging and appropriate for the selected grade level.`,
        created_at: new Date().toISOString(),
        language: formData.language,
        academic_grade: formData.academic_grade,
        subject: formData.subject,
        word_count: formData.word_count,
        summary: formData.generate_summary ? `This is a mock summary of a story about ${formData.subject} for grade ${formData.academic_grade} students. It covers basic concepts in an engaging way.` : null,
        vocabulary: formData.generate_vocabulary ? [
          { term: `${formData.subject} Term 1`, definition: 'Definition for the first term related to the subject.', importance: 10 },
          { term: `${formData.subject} Term 2`, definition: 'Definition for the second term related to the subject.', importance: 8 },
          { term: `${formData.subject} Term 3`, definition: 'Definition for the third term related to the subject.', importance: 6 }
        ] : null,
        quiz: formData.generate_quiz ? [
          {
            question: `What is the main subject of this story?`,
            options: [formData.subject, 'History', 'Mathematics', 'Art'],
            correct_answer: 0
          },
          {
            question: `Who is the main character of the story?`,
            options: ['A teacher', formData.main_character || 'A curious student', 'A scientist', 'A historian'],
            correct_answer: 1
          },
          {
            question: `What grade level is this story intended for?`,
            options: ['Kindergarten', 'Elementary', 'Middle School', formData.academic_grade],
            correct_answer: 3
          }
        ] : null
      });
    }, 2000));
  }

  // Update UI for authenticated user
  function updateUIForAuthenticatedUser(user) {
    window.isAnonymousUser = false;
    window.currentUser = user;
    
    // Update any login/logout buttons
    const loginButtons = document.querySelectorAll('.login-button');
    loginButtons.forEach(button => {
      button.textContent = 'My Account';
      button.href = '/account';
    });
    
    // Update any user-specific elements
    const userElements = document.querySelectorAll('.user-name');
    userElements.forEach(element => {
      element.textContent = user.email;
    });
    
    // Show user-only content
    const userOnlyElements = document.querySelectorAll('.user-only');
    userOnlyElements.forEach(element => {
      element.style.display = 'block';
    });
    
    // Hide guest-only content
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    guestOnlyElements.forEach(element => {
      element.style.display = 'none';
    });
  }

  // Update UI for anonymous user
  function updateUIForAnonymousUser() {
    window.isAnonymousUser = true;
    window.currentUser = null;
    
    // Update any login/logout buttons
    const loginButtons = document.querySelectorAll('.login-button');
    loginButtons.forEach(button => {
      button.textContent = 'Log In';
      button.href = '/login';
    });
    
    // Hide user-specific elements
    const userOnlyElements = document.querySelectorAll('.user-only');
    userOnlyElements.forEach(element => {
      element.style.display = 'none';
    });
    
    // Show guest-only content
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    guestOnlyElements.forEach(element => {
      element.style.display = 'block';
    });
  }

  // Handle unhandled promise rejections
  function handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    window.showToast?.('An unexpected error occurred', 'error');
  }

  // Handle global errors
  function handleGlobalError(event) {
    console.error('Global error:', event.error);
    window.showToast?.('An unexpected error occurred', 'error');
    
    // Prevent default browser error handling
    event.preventDefault();
  }

  // Handle continuation form request
  function handleShowContinuationForm(event) {
    console.log('Show continuation form requested:', event.detail);
    
    // Get the original story from the event
    const { originalStory } = event.detail;
    
    if (!originalStory || !originalStory.content) {
      console.error('Missing story details for continuation');
      window.showToast?.('Cannot continue story: missing details', 'error');
      return;
    }
    
    // Check if we have vocabulary from the current story
    if (window.currentStory && window.currentStory.vocabulary && 
        (!originalStory.vocabulary || originalStory.vocabulary.length === 0)) {
      
      console.log('No vocabulary found in originalStory. Adding vocabulary from window.currentStory:', 
        window.currentStory.vocabulary);
      
      // Add vocabulary from current story if missing in the originalStory
      originalStory.vocabulary = window.currentStory.vocabulary;
      
      // Make sure vocabulary items have importance property
      if (originalStory.vocabulary) {
        originalStory.vocabulary = originalStory.vocabulary.map(item => {
          if (typeof item.importance === 'undefined') {
            return { ...item, importance: 5 };
          }
          return item;
        });
      }
    }
    
    // Log what vocabulary we have
    console.log('Original story vocabulary:', originalStory.vocabulary);
    
    // Find the continuation container
    const continuationContainer = document.querySelector('.continuation-container');
    if (!continuationContainer) {
      console.error('Continuation container not found');
      window.showToast?.('Cannot find continuation area', 'error');
      return;
    }
    
    // Find or create the story-continuation component
    let storyContinuation = continuationContainer.querySelector('story-continuation');
    if (!storyContinuation) {
      console.log('Creating story-continuation component');
      storyContinuation = document.createElement('story-continuation');
      continuationContainer.appendChild(storyContinuation);
      componentStatus['story-continuation'] = true;
    }
    
    // Set the original story on the component
    storyContinuation.originalStory = originalStory;
    
    // Show the continuation container
    continuationContainer.classList.remove('hidden');
    
    // Scroll to the continuation container so it's visible at the top of the viewport
    setTimeout(() => {
      // Calculate position that places the container at the top with header clearance
      const headerHeight = 80; // Estimate header height, adjust as needed
      const rect = continuationContainer.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset - headerHeight;
      
      // Smoothly scroll to position the container at the top
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // After a short delay, focus on the difficulty selector to draw attention
      setTimeout(() => {
        const difficultySelector = continuationContainer.querySelector('difficulty-selector');
        if (difficultySelector) {
          // Highlight the difficulty selector to draw attention
          difficultySelector.classList.add('highlight-element');
          setTimeout(() => {
            difficultySelector.classList.remove('highlight-element');
          }, 1500);
        }
      }, 300);
    }, 0); // Immediate execution to prevent visible delay
    
    window.showToast?.('Ready to continue your story!', 'info');
  }

  // Handle continue-story event from continuation-result
  function handleContinueStory(event) {
    console.log('Continue story event received:', event.detail);
    
    const { story } = event.detail;
    
    if (!story || !story.content) {
      console.error('Missing story details for further continuation');
      window.showToast?.('Cannot continue: missing story details', 'error');
      return;
    }
    
    // Update the current story to the continued story
    window.currentStory = story;
    
    // Find the continuation container
    const continuationContainer = document.querySelector('.continuation-container');
    if (!continuationContainer) {
      console.error('Continuation container not found');
      window.showToast?.('Cannot find continuation area', 'error');
      return;
    }
    
    // Find or create the story-continuation component
    let storyContinuation = continuationContainer.querySelector('story-continuation');
    if (!storyContinuation) {
      console.log('Creating story-continuation component');
      storyContinuation = document.createElement('story-continuation');
      continuationContainer.appendChild(storyContinuation);
      componentStatus['story-continuation'] = true;
    }
    
    // Set the original story on the component
    storyContinuation.originalStory = story;
    
    // Show the continuation container
    continuationContainer.classList.remove('hidden');
    
    // Scroll to the continuation container so it's visible at the top of the viewport
    setTimeout(() => {
      // Calculate position that places the container at the top with header clearance
      const headerHeight = 80; // Estimate header height, adjust as needed
      const rect = continuationContainer.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset - headerHeight;
      
      // Smoothly scroll to position the container at the top
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // After a short delay, focus on the difficulty selector to draw attention
      setTimeout(() => {
        const difficultySelector = continuationContainer.querySelector('difficulty-selector');
        if (difficultySelector) {
          // Highlight the difficulty selector to draw attention
          difficultySelector.classList.add('highlight-element');
          setTimeout(() => {
            difficultySelector.classList.remove('highlight-element');
          }, 1500);
        }
      }, 300);
    }, 0); // Immediate execution to prevent visible delay
    
    window.showToast?.('Ready to continue your story further!', 'info');
  }

  // Make public methods available globally
  window.generateStory = generateStory;
})(); 