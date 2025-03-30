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
    return config;
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
      console.error('Proxy fetch error:', error);
      
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
    const url = `${apiBaseUrl}/stories/generate`;
    console.log(`Generating story via proxy. Target: ${url}`);
    
    try {
      // Try POST first
      try {
        console.log('Attempting POST via proxy');
        const postResult = await fetchViaProxy(url, {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Proxy POST successful');
        return postResult;
      } catch (postError) {
        console.error('Proxy POST failed:', postError);
        
        // Try GET as fallback
        console.log('Attempting GET via proxy as fallback');
        
        // Build query string
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        
        const getUrl = `${url}?${params.toString()}`;
        const getResult = await fetchViaProxy(getUrl);
        console.log('Proxy GET successful');
        return getResult;
      }
    } catch (error) {
      console.error('All proxy methods failed:', error);
      throw new Error('Failed to generate story through proxy. Please try again.');
    }
  }
  
  // Public API
  return {
    init,
    fetchViaProxy,
    generateStory
  };
})();

// Initialize and make available globally
window.proxyService = proxyService.init();

console.log('Proxy service initialized and ready to use'); 