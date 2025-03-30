/**
 * Proxy Service
 * Provides alternative methods to access the API when CORS issues occur
 */

// Create proxy service module
const proxyService = (function() {
  // Public CORS proxies that can be used
  const publicProxies = [
    'https://corsproxy.io/?',  // Add the target URL after this
    'https://api.allorigins.win/raw?url='  // Add encoded URL after this
  ];
  
  // Default options
  const defaultOptions = {
    timeout: 30000,
    proxyIndex: 0,  // Which proxy to use by default
    retries: 2
  };
  
  // Initialize with options
  function init(options = {}) {
    const config = {...defaultOptions, ...options};
    console.log('Proxy service initialized with options:', config);
    return {
      // Return both config and methods
      ...config,
      fetchViaProxy,
      generateStory
    };
  }
  
  // Fetch via proxy
  async function fetchViaProxy(url, options = {}) {
    const config = {...defaultOptions, ...options};
    const proxyUrl = buildProxyUrl(url, config.proxyIndex);
    
    console.log(`Fetching via proxy: ${proxyUrl}`);
    
    try {
      // Create fetch options with appropriate headers
      const fetchOptions = {
        method: options.method || 'GET',
        headers: options.headers || {'Content-Type': 'application/json'},
        mode: 'cors',
        cache: 'no-cache'
      };
      
      // Add body for POST/PUT/PATCH requests
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method)) {
        fetchOptions.body = options.body;
      }
      
      // Set timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      fetchOptions.signal = controller.signal;
      
      // Make the request
      const response = await fetch(proxyUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        const error = await response.text().catch(() => 'Unknown error');
        throw new Error(`Proxy request failed with status ${response.status}: ${error}`);
      }
      
      // Parse response
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      // Improve error logging with more details
      const errorDetails = {
        message: error.message || 'Unknown error',
        name: error.name || 'Error',
        url: proxyUrl
      };
      
      console.error('Proxy fetch error:', errorDetails);
      
      // Try alternate proxy if retries are available
      if (config.retries > 0) {
        const nextProxyIndex = (config.proxyIndex + 1) % publicProxies.length;
        console.log(`Retrying with proxy #${nextProxyIndex}`);
        
        return fetchViaProxy(url, {
          ...options,
          proxyIndex: nextProxyIndex,
          retries: config.retries - 1
        });
      }
      
      throw error;
    }
  }
  
  // Build proxy URL
  function buildProxyUrl(url, proxyIndex = 0) {
    const proxy = publicProxies[proxyIndex] || publicProxies[0];
    
    // For proxies that need encoded URLs
    if (proxy.includes('url=')) {
      return proxy + encodeURIComponent(url);
    }
    
    // For proxies that simply prepend
    return proxy + url;
  }
  
  // Generate a story via proxy
  async function generateStory(apiBaseUrl, formData) {
    // Use the provided API base URL or fall back to the environment variable
    const baseUrl = apiBaseUrl || window.ENV_API_URL || "https://easystory.onrender.com"; // User needs to update this URL
    // Use POST /stories/generate as defined in the FastAPI backend
    const endpoint = '/stories/generate';
    const url = `${baseUrl}${endpoint}`;
    console.log(`Generating story via proxy. Target: ${url}`);
    
    try {
      // Only try POST via proxy
      console.log('Attempting POST via proxy');
      const postResult = await fetchViaProxy(url, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Proxy POST successful');
      
      // Verify that the result contains the expected story properties
      if (typeof postResult === 'object' && (postResult.content || postResult.title)) {
        return postResult;
      } else {
        console.warn('Proxy returned unexpected data format (POST):', postResult);
        if (typeof postResult === 'string') {
          console.log('Raw POST response string from proxy:', postResult.substring(0, 500)); 
          try {
            const parsedResult = JSON.parse(postResult);
            console.log('Successfully parsed string response as JSON');
            return parsedResult;
          } catch (e) {
            console.error('Could not parse string as JSON (POST):', e);
            return {
              title: `Generated Story (${formData.subject || 'General'})`,
              content: postResult,
              generated_at: new Date().toISOString()
            };
          }
        } else {
          return postResult;
        }
      }
    } catch (error) {
      // If POST via proxy fails, log and throw specific error
      console.error('POST via proxy failed:', error);
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('cors') || errorMsg.includes('network') || errorMsg.includes('failed to fetch')) {
        throw new Error(`Proxy service couldn't access the API via POST due to CORS/network issues.`);
      } else if (errorMsg.includes('parse')) {
        throw new Error(`Proxy POST received response but couldn't parse it.`);
      } else {
        throw new Error(`Story generation via proxy POST failed: ${error.message}`);
      }
    }
  }
  
  // The return in init() replaces this now that we're returning methods there
  return {
    init
  };
})();

// Initialize and make available globally
window.proxyService = proxyService.init();

console.log('Proxy service initialized and ready to use'); 