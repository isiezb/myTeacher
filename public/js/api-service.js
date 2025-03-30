/**
 * API Service
 * Handles all communication with the backend API
 */

// Create API service module
const apiService = (function() {
  // Private variables
  let _baseUrl = '';
  let _headers = {
    'Content-Type': 'application/json'
  };
  let _defaultOptions = {
    timeout: 30000, // 30 seconds
    retries: 2
  };

  // Initialize the service
  function init(options = {}) {
    // Use environment variable if available, fallback to options or default
    _baseUrl = window.ENV_API_URL || options.baseUrl || 'https://easystory.onrender.com';
    
    // Set up additional headers if provided
    if (options.headers) {
      _headers = { ..._headers, ...options.headers };
    }
    
    // Merge with default options
    _defaultOptions = { ..._defaultOptions, ...options };
    
    console.log('Using existing config for API service');
    
    return {
      baseUrl: _baseUrl,
      headers: _headers,
      options: _defaultOptions
    };
  }

  // Get API version and status
  async function getStatus() {
    try {
      console.log(`API Service initialized with base URL: ${_baseUrl}`);
      return await _request('/status');
    } catch (error) {
      console.error('Error getting API status:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Test connection to server
  async function testConnection() {
    try {
      console.log(`Testing connection to server: ${_baseUrl}`);
      
      // First, try a simple CORS preflight test
      console.log('Testing CORS preflight...');
      const corsTest = await fetch(_baseUrl, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
          'Origin': window.location.origin
        },
        mode: 'cors'
      }).catch(err => {
        console.error('CORS preflight test failed:', err);
        return { ok: false, status: 0, statusText: err.message };
      });
      
      console.log('CORS preflight test result:', {
        ok: corsTest.ok,
        status: corsTest.status,
        statusText: corsTest.statusText
      });
      
      // Then do the actual request
      const response = await fetch(_baseUrl, {
        method: 'GET',
        headers: _headers,
        mode: 'cors',
        cache: 'no-cache'
      }).catch(err => {
        console.error('Main fetch test failed:', err);
        return { ok: false, status: 0, statusText: err.message };
      });
      
      console.log('Fetch response headers:', {
        'content-type': response.headers.get('content-type'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      });
      
      let data;
      try {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        data = isJson ? await response.json() : await response.text();
      } catch (err) {
        console.warn('Failed to parse response:', err);
        data = `[Failed to parse: ${err.message}]`;
      }
      
      console.log('Server connection test result:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
      
      if (typeof data === 'string') {
        console.log('Server response body (truncated):', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
      } else {
        console.log('Server response body:', data);
      }
      
      return {
        ok: response.ok,
        status: response.status,
        data,
        cors: {
          preflight: corsTest.ok,
          preflightStatus: corsTest.status
        }
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  // Generate a story
  async function generateStory(formData) {
    console.log(`Generating story... API URL: ${_baseUrl}/stories/generate`);
    
    try {
      // Try using the POST method
      console.log('Attempting POST request with fetch');
      const postResponse = await fetch(`${_baseUrl}/stories/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(formData)
      });
      
      console.log('POST response status:', postResponse.status);
      
      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log('Story generated successfully via POST');
        return data;
      }
      
      // If POST failed, we'll try an alternative method (GET with params)
      console.log('POST failed, trying alternative method...');
      
      // Convert form data to query string for GET request
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
      
      const getUrl = `${_baseUrl}/stories/generate?${params.toString()}`;
      console.log('Attempting GET request:', getUrl.substring(0, 100) + '...');
      
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('GET response status:', getResponse.status);
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        console.log('Story generated successfully via GET');
        return data;
      }
      
      // If both methods failed, try to get error details
      const errorText = await postResponse.text().catch(() => 'Failed to get error details');
      throw new Error(`API request failed: ${postResponse.status} - ${errorText}`);
    } catch (error) {
      console.error('Error generating story:', error);
      
      // Log helpful debugging info
      console.error('Request details:', {
        url: `${_baseUrl}/stories/generate`,
        formData,
        headers: _headers
      });
      
      throw error;
    }
  }

  // Get a story by ID
  async function getStory(storyId) {
    try {
      return await _request(`/stories/${storyId}`);
    } catch (error) {
      console.error(`Error getting story ${storyId}:`, error);
      throw new Error('Failed to load story. Please try again.');
    }
  }

  // Get all stories for a user
  async function getUserStories(userId) {
    try {
      return await _request(`/stories/user/${userId}`);
    } catch (error) {
      console.error('Error getting user stories:', error);
      throw new Error('Failed to load stories. Please try again.');
    }
  }

  // Save a story
  async function saveStory(storyData) {
    try {
      return await _request('/stories', {
        method: 'POST',
        body: JSON.stringify(storyData)
      });
    } catch (error) {
      console.error('Error saving story:', error);
      throw new Error('Failed to save story. Please try again.');
    }
  }

  // Delete a story
  async function deleteStory(storyId) {
    try {
      return await _request(`/stories/${storyId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error deleting story ${storyId}:`, error);
      throw new Error('Failed to delete story. Please try again.');
    }
  }

  // Generate a quiz for a story
  async function generateQuiz(storyId, options = {}) {
    try {
      return await _request(`/stories/${storyId}/quiz`, {
        method: 'POST',
        body: JSON.stringify(options)
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz. Please try again.');
    }
  }

  // Continue a story
  async function continueStory(storyId, options = {}) {
    try {
      return await _request(`/stories/${storyId}/continue`, {
        method: 'POST',
        body: JSON.stringify(options)
      });
    } catch (error) {
      console.error('Error continuing story:', error);
      throw new Error('Failed to continue story. Please try again.');
    }
  }

  // Private method for making requests
  async function _request(endpoint, options = {}) {
    // Set up request options
    const requestOptions = {
      method: options.method || 'GET',
      headers: { ..._headers, ...options.headers },
      credentials: 'same-origin',
      mode: 'cors',
      cache: 'no-cache',
      ...options
    };
    
    // Add authentication header if available
    if (window.supabase && window.supabase.auth) {
      const { data } = await window.supabase.auth.getSession();
      if (data.session) {
        requestOptions.headers['Authorization'] = `Bearer ${data.session.access_token}`;
      }
    }
    
    // Set up URL
    const url = endpoint.startsWith('http') ? endpoint : _baseUrl + endpoint;
    
    // Set up timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), _defaultOptions.timeout);
    requestOptions.signal = controller.signal;
    
    try {
      // Make the request
      const response = await fetch(url, requestOptions);
      clearTimeout(timeout);
      
      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      // Parse and return response data
      return await response.json();
    } catch (error) {
      // Handle aborted requests
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Handle network errors
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Rethrow all other errors
      throw error;
    }
  }

  // Public API
  return {
    init,
    getStatus,
    testConnection,
    generateStory,
    getStory,
    getUserStories,
    saveStory,
    deleteStory,
    generateQuiz,
    continueStory
  };
})();

// Initialize API service with config
apiService.init(window.appConfig?.api || {});

// Expose API methods globally
window.apiService = apiService;

// Test connection on load
document.addEventListener('DOMContentLoaded', () => {
  apiService.testConnection().catch(console.error);
}); 