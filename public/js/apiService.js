// API Service to handle all backend communication
const ApiService = {
  // Generate a story based on parameters
  async generateStory(params) {
    try {
      const response = await fetch(`${window.ENV.API_URL}${window.CONFIG.ENDPOINTS.GENERATE_STORY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating story:', error);
      return { error: error.message };
    }
  },
  
  // Save a story to the backend
  async saveStory(story) {
    if (window.CONFIG.FEATURES.ENABLE_SAVE) {
      // If Supabase is enabled, try to use it
      if (typeof window.SupabaseService !== 'undefined') {
        try {
          return await window.SupabaseService.saveStory(story);
        } catch (error) {
          console.error('Supabase save failed, trying API:', error);
        }
      }
      
      try {
        const response = await fetch(`${window.ENV.API_URL}${window.CONFIG.ENDPOINTS.SAVE_STORY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(story),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error saving story:', error);
        return { error: error.message };
      }
    } else {
      return { error: 'Save feature is disabled' };
    }
  },
  
  // Get all stories
  async getStories() {
    // If Supabase is enabled, try to use it
    if (typeof window.SupabaseService !== 'undefined') {
      try {
        return await window.SupabaseService.getStories();
      } catch (error) {
        console.error('Supabase get failed, trying API:', error);
      }
    }
    
    try {
      const response = await fetch(`${window.ENV.API_URL}${window.CONFIG.ENDPOINTS.LIST_STORIES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching stories:', error);
      return { error: error.message };
    }
  },
  
  // Mock generate function for development/testing
  // This can be used if the backend is not ready
  mockGenerateStory(params) {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const mockStory = {
          title: `A ${params.subject} Adventure`,
          content: `Once upon a time, in a ${params.setting || 'classroom'}, ${params.characters || 'a student'} discovered the fascinating world of ${params.subject}. 
          
They were learning about ${params.topic || 'important concepts'} and found it both challenging and exciting.
          
Through perseverance and curiosity, they mastered the topic and shared their knowledge with others.
          
The end.`,
          grade: params.grade,
          subject: params.subject,
          topic: params.topic,
          created_at: new Date().toISOString(),
        };
        
        // Store the story in the global variable for fallback functionality
        window.currentStory = mockStory;
        
        resolve({ data: mockStory });
      }, 1500);
    });
  }
};

// Make the service available globally
window.ApiService = ApiService; 