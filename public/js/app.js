/**
 * Main application script
 */

// Initialize the application
(function initApp() {
  // Add global event listeners
  document.addEventListener('DOMContentLoaded', onDocumentReady);
  window.addEventListener('error', handleGlobalError);

  // On DOM ready
  function onDocumentReady() {
    console.log('DOM content loaded');
    setupComponents();
    setupEventListeners();

    // Check if Lit components are ready
    if (window.litComponentsReady) {
      console.log('Lit components already initialized');
    }

    // Initialize Supabase if available
    try {
      if (window.initSupabase && typeof window.initSupabase === 'function') {
        window.initSupabase()
          .then(() => checkUserSession())
          .catch(err => {
            console.warn('Failed to initialize auth:', err);
          });
      } else {
        console.warn('Supabase not initialized, skipping user session check');
      }
    } catch (err) {
      console.error('Error during authentication setup:', err);
    }

    console.log('App initialized successfully');
  }

  // Check user session
  function checkUserSession() {
    if (window.supabase && window.supabase.auth) {
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
      window.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('User is signed in:', session.user.email);
          updateUIForAuthenticatedUser(session.user);
        } else {
          console.log('No active session, user is anonymous');
          updateUIForAnonymousUser();
        }
      });
    }
  }

  // Set up components
  function setupComponents() {
    // Add toast container if it doesn't exist
    if (!document.querySelector('toast-container')) {
      const toastContainer = document.createElement('toast-container');
      document.body.appendChild(toastContainer);
    }

    // Add loading overlay if it doesn't exist
    if (!document.querySelector('loading-overlay')) {
      const loadingOverlay = document.createElement('loading-overlay');
      document.body.appendChild(loadingOverlay);
    }

    // Since story-form is directly in the HTML, make sure it exists or create it if not
    const generatorTab = document.getElementById('generator-tab');
    if (generatorTab && !generatorTab.querySelector('story-form')) {
      console.log('Story form not found in generator tab, creating one');
      const storyForm = document.createElement('story-form');
      // Insert the form at the beginning of the generator tab
      generatorTab.insertBefore(storyForm, generatorTab.firstChild);
    }

    // Show the story result area when a story is generated
    const storyResult = document.getElementById('story-result');
    if (storyResult) {
      const storyDisplay = storyResult.querySelector('story-display');
      if (storyDisplay) {
        storyDisplay.addEventListener('story-updated', () => {
          storyResult.classList.remove('hidden');
        });
      }
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Listen for story form submission
    document.addEventListener('story-form-submit', handleStoryFormSubmit);
  }

  // Handle form submission
  async function handleStoryFormSubmit(event) {
    const formData = event.detail.formData;
    console.log('Form data submitted:', formData);

    // Show loading indicator
    window.showLoading?.('Creating your educational story...');

    // Find the form component
    const formComponent = document.querySelector('story-form');
    if (formComponent) {
      formComponent.isSubmitting = true;
    }

    try {
      // Call API to generate story
      const story = await generateStory(formData);

      // Find story display component and update it
      const storyDisplay = document.querySelector('story-display');
      if (storyDisplay) {
        storyDisplay.story = story;
        // Trigger custom event for story update
        storyDisplay.dispatchEvent(new CustomEvent('story-updated', {
          bubbles: true,
          composed: true
        }));
      }

      // Show the story result container if hidden
      const storyResult = document.getElementById('story-result');
      if (storyResult) {
        storyResult.classList.remove('hidden');
      }

      // Scroll to story display
      if (storyResult) {
        storyResult.scrollIntoView({ behavior: 'smooth' });
      }

      // Show success message
      window.showToast?.('Story generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating story:', error);
      window.showToast?.('Failed to generate story. Please try again.', 'error');
    } finally {
      // Hide loading indicator
      window.hideLoading?.();

      // Reset form submitting state
      if (formComponent) {
        formComponent.isSubmitting = false;
      }
    }
  }

  // Generate a story using form data
  async function generateStory(formData) {
    // Default API base URL
    const baseUrl = window.ENV_API_URL || "https://easystory.onrender.com";
    console.log('Using base URL:', baseUrl);
    
    // First try direct API access
    if (window.apiService && typeof window.apiService.generateStory === 'function') {
      console.log('Using API service to generate story');
      try {
        const result = await window.apiService.generateStory(formData);
        console.log('Direct API request successful');
        return result;
      } catch (error) {
        console.error('API service error:', error);
        
        // If this looks like a CORS or network error, try using proxy
        if (window.proxyService && 
            (error.message.includes('CORS') || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('Network') ||
             error.message.includes('TypeError'))) {
          
          console.log('CORS/Network issue detected, trying proxy service...');
          try {
            const proxyResult = await window.proxyService.generateStory(baseUrl, formData);
            console.log('Proxy request successful');
            return proxyResult;
          } catch (proxyError) {
            console.error('Proxy service error:', proxyError);
            window.showToast?.('API Service Unavailable: Using mock data for demonstration', 'warning');
            
            // Fall back to mock data as last resort
            console.log('All remote methods failed. Using mock story data.');
            return mockGenerateStory(formData);
          }
        } else {
          window.showToast?.('API error: ' + error.message, 'error');
          
          // Fallback to mock if API fails for non-CORS reasons
          console.log('API error (non-CORS). Using mock story generation');
          return mockGenerateStory(formData);
        }
      }
    } else if (window.proxyService) {
      // Try proxy service if API service isn't available
      console.log('API service not available, trying proxy service');
      try {
        const proxyResult = await window.proxyService.generateStory(baseUrl, formData);
        console.log('Proxy request successful');
        return proxyResult;
      } catch (proxyError) {
        console.error('Proxy service error:', proxyError);
        window.showToast?.('Remote services unavailable. Using mock data.', 'warning');
        return mockGenerateStory(formData);
      }
    } else {
      // No API or proxy service available
      console.log('No API or proxy service available. Using mock data.');
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
        word_count: formData.word_count
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

  // Handle global errors
  function handleGlobalError(event) {
    console.error('Global error:', event.error || event.message);
    
    // Only show toast for script errors, not network errors
    if (event.error && !(event.error instanceof TypeError && event.error.toString().includes('NetworkError'))) {
      window.showToast?.('An error occurred. Please try again.', 'error');
    }
    
    // Prevent the error from showing in console again
    event.preventDefault();
  }

  // Make public methods available globally
  window.generateStory = generateStory;
})(); 