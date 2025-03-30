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
    const baseUrl = apiBaseUrl || window.ENV_API_URL || "https://easystory.onrender.com";
    // Target /stories/generate
    const endpoint = '/stories/generate';
    const url = `${baseUrl}${endpoint}`;
    console.log(`Generating story via proxy. Target: ${url}`);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
      const getUrl = `${url}?${params.toString()}`;
      
      console.log(`Attempting GET via proxy: ${getUrl.substring(0, 150)}...`);
      
      // Try GET first since that seems more likely to work based on logs
      const getResult = await fetchViaProxy(getUrl, {
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('Proxy GET successful');
      
      // Validation for GET result
      if (typeof getResult === 'object' && (getResult.content || getResult.title)) {
        return getResult;
      } else {
        console.warn('GET proxy returned unexpected data format:', getResult);
        if (typeof getResult === 'string') {
          console.log('Raw GET response string from proxy:', getResult.substring(0, 500));
          try {
            const parsedResult = JSON.parse(getResult);
            console.log('Successfully parsed GET string response as JSON');
            return parsedResult;
          } catch (e) {
            console.error('Could not parse string as JSON (GET):', e);
            // Return fallback object
            return {
              title: `Generated Story (${formData.subject || 'General'})`,
              content: getResult,
              generated_at: new Date().toISOString()
            };
          }
        } else {
          // If not object or string, return what we got
          return getResult;
        }
      }
    } catch (error) {
      // If GET via proxy fails, log and throw specific error
      console.error('GET via proxy failed:', error);
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('cors') || errorMsg.includes('network') || errorMsg.includes('failed to fetch')) {
        throw new Error(`Proxy service couldn't access the API via GET due to CORS/network issues.`);
      } else if (errorMsg.includes('parse')) {
        throw new Error(`Proxy GET received response but couldn't parse it.`);
      } else {
        throw new Error(`Story generation via proxy GET failed: ${error.message}`);
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