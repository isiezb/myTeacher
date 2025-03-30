// Supabase client initialization
console.log('Loading Supabase client...');

// Initialize Supabase client
async function initSupabaseClient() {
  // Check if Supabase is already initialized
  if (window.supabase) {
    console.log('Supabase client already initialized');
    return window.supabase;
  }

  // Check if Supabase script is loaded
  if (typeof supabase === 'undefined') {
    console.warn('Supabase script not loaded, loading dynamically...');
    
    // Load the Supabase script if needed
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.31.0/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = window.ENV_SUPABASE_URL;
    const supabaseKey = window.ENV_SUPABASE_KEY;

    // Check for valid credentials
    if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL') ||
        !supabaseKey || supabaseKey.includes('YOUR_SUPABASE_KEY')) {
      console.warn('Invalid Supabase credentials. Using mock Supabase client.');
      return createMockSupabaseClient();
    }

    // Create the Supabase client
    console.log('Creating Supabase client with URL:', supabaseUrl);
    const client = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // Store client in window object
    window.supabase = client;
    console.log('Supabase client initialized successfully');
    
    return client;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return createMockSupabaseClient();
  }
}

// Create a mock Supabase client for development/fallback
function createMockSupabaseClient() {
  console.log('Creating mock Supabase client');
  
  // In-memory storage for development
  const mockData = {
    stories: []
  };
  
  // Mock Supabase client
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        console.log('Mock auth state change registered');
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: () => Promise.resolve({ error: null })
    },
    from: (table) => ({
      select: () => ({
        order: (column, { ascending = true } = {}) => ({
          then: (callback) => {
            console.log(`Mock select from ${table}, order by ${column}`);
            if (table === 'stories') {
              return Promise.resolve(callback({ data: mockData.stories, error: null }));
            }
            return Promise.resolve(callback({ data: [], error: null }));
          }
        })
      }),
      insert: (data) => ({
        then: (callback) => {
          console.log(`Mock insert into ${table}:`, data);
          if (table === 'stories') {
            const newData = Array.isArray(data) ? data : [data];
            newData.forEach(item => {
              item.id = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              item.created_at = new Date().toISOString();
              mockData.stories.push(item);
            });
            return Promise.resolve(callback({ data: newData, error: null }));
          }
          return Promise.resolve(callback({ data: null, error: null }));
        }
      }),
      update: (data) => ({
        match: (criteria) => ({
          then: (callback) => {
            console.log(`Mock update ${table} where:`, criteria);
            return Promise.resolve(callback({ data: null, error: null }));
          }
        })
      }),
      delete: () => ({
        match: (criteria) => ({
          then: (callback) => {
            console.log(`Mock delete from ${table} where:`, criteria);
            return Promise.resolve(callback({ data: null, error: null }));
          }
        })
      })
    })
  };
  
  // Store mock client in window object
  window.supabase = mockClient;
  return mockClient;
}

// Supabase service for story operations
const SupabaseService = {
  // Save story to Supabase
  async saveStory(story) {
    if (!window.supabase) {
      await initSupabaseClient();
    }
    
    // Check if we have a valid Supabase client
    if (!window.supabase || !window.supabase.from) {
      console.error('Supabase client not properly initialized');
      throw new Error('Supabase client not properly initialized');
    }
    
    try {
      // Prepare story data for saving
      const storyData = {
        title: story.title || 'Untitled Story',
        content: story.content || '',
        summary: story.summary || '',
        academic_grade: story.academic_grade || '',
        subject: story.subject || '',
        word_count: parseInt(story.word_count) || 0,
        vocab_list: Array.isArray(story.vocabulary) ? story.vocabulary : [],
        quiz_data: Array.isArray(story.quiz) ? story.quiz : []
      };
      
      // Include ID if it exists and is not a mock ID
      if (story.id && !story.id.startsWith('mock-')) {
        storyData.id = story.id;
      }
      
      console.log('Saving story to Supabase:', storyData);
      
      // Insert into the stories table - removed .execute()
      const { data, error } = await window.supabase
        .from('stories')
        .insert(storyData);
        
      if (error) {
        console.error('Error saving story to Supabase:', error);
        throw new Error(`Failed to save story: ${error.message}`);
      }
      
      console.log('Story saved successfully:', data);
      return data[0];
    } catch (err) {
      console.error('Error in saveStory:', err);
      window.showToast(`Failed to save story: ${err.message}`, 'error');
      throw err;
    }
  },
  
  // Get all stories from Supabase
  async getStories() {
    try {
      if (!window.supabase) {
        await initSupabaseClient();
      }
      
      // Check if we have a valid Supabase client
      if (!window.supabase || !window.supabase.from) {
        console.error('Supabase client not properly initialized');
        throw new Error('Supabase client not properly initialized');
      }
      
      console.log('Fetching stories from Supabase');
      
      // Removed .execute()
      const { data, error } = await window.supabase
        .from('stories')
        .select()
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching stories from Supabase:', error);
        throw new Error(`Failed to fetch stories: ${error.message}`);
      }
      
      console.log('Fetched stories:', data);
      return data;
    } catch (err) {
      console.error('Error in getStories:', err);
      window.showToast(`Failed to fetch stories: ${err.message}`, 'error');
      throw err;
    }
  }
};

// Export initSupabase function to be used by the app
window.initSupabase = initSupabaseClient;
window.SupabaseService = SupabaseService;

console.log('Supabase module loaded, ready for initialization'); 