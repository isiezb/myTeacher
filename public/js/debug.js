/**
 * Debug helper for troubleshooting component loading issues
 */

// Initialize debugging
(function() {
  // Record original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Store logs for debug display
  window.debugLogs = {
    messages: [],
    errors: [],
    warnings: []
  };
  
  // Override console methods
  console.log = function() {
    const args = Array.from(arguments);
    window.debugLogs.messages.push({
      timestamp: new Date().toISOString(),
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
    });
    originalLog.apply(console, arguments);
  };
  
  console.error = function() {
    const args = Array.from(arguments);
    window.debugLogs.errors.push({
      timestamp: new Date().toISOString(),
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
    });
    originalError.apply(console, arguments);
  };
  
  console.warn = function() {
    const args = Array.from(arguments);
    window.debugLogs.warnings.push({
      timestamp: new Date().toISOString(),
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
    });
    originalWarn.apply(console, arguments);
  };
  
  // Add error event listener
  window.addEventListener('error', function(event) {
    window.debugLogs.errors.push({
      timestamp: new Date().toISOString(),
      message: `ERROR: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      error: event.error ? event.error.stack : 'No stack trace available'
    });
  });
  
  // Add unhandled promise rejection listener
  window.addEventListener('unhandledrejection', function(event) {
    window.debugLogs.errors.push({
      timestamp: new Date().toISOString(),
      message: 'Unhandled Promise Rejection',
      error: event.reason ? (event.reason.stack || event.reason.toString()) : 'Unknown reason'
    });
  });
  
  // Add keyboard shortcut to show debug logs (Ctrl+Shift+D)
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      showDebugPanel();
    }
  });
  
  // Create debug panel to display logs
  function showDebugPanel() {
    // Check if panel already exists
    if (document.getElementById('debug-panel')) {
      document.getElementById('debug-panel').remove();
      return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.left = '0';
    panel.style.width = '100%';
    panel.style.height = '80%';
    panel.style.background = '#fff';
    panel.style.border = '1px solid #ccc';
    panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    panel.style.zIndex = '10000';
    panel.style.overflow = 'auto';
    panel.style.padding = '20px';
    panel.style.boxSizing = 'border-box';
    
    // Create tabs for different log types
    const tabs = document.createElement('div');
    tabs.style.display = 'flex';
    tabs.style.marginBottom = '10px';
    
    const createTab = (label, active = false) => {
      const tab = document.createElement('div');
      tab.textContent = label;
      tab.style.padding = '10px 15px';
      tab.style.cursor = 'pointer';
      tab.style.background = active ? '#007bff' : '#f8f9fa';
      tab.style.color = active ? '#fff' : '#000';
      tab.style.border = '1px solid #dee2e6';
      tab.style.marginRight = '5px';
      tab.dataset.tab = label.toLowerCase();
      return tab;
    };
    
    const errorsTab = createTab('Errors', true);
    const warningsTab = createTab('Warnings');
    const logsTab = createTab('Logs');
    const componentsTab = createTab('Components');
    
    tabs.appendChild(errorsTab);
    tabs.appendChild(warningsTab);
    tabs.appendChild(logsTab);
    tabs.appendChild(componentsTab);
    
    panel.appendChild(tabs);
    
    // Create content area
    const content = document.createElement('div');
    content.style.padding = '10px';
    content.style.border = '1px solid #dee2e6';
    content.style.height = 'calc(100% - 60px)';
    content.style.overflow = 'auto';
    panel.appendChild(content);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.style.padding = '5px 10px';
    closeBtn.style.background = '#dc3545';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '3px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => panel.remove());
    panel.appendChild(closeBtn);
    
    // Show errors content initially
    showTabContent('errors');
    
    // Tab click events
    tabs.addEventListener('click', (e) => {
      if (e.target.dataset.tab) {
        // Update active tab styling
        Array.from(tabs.children).forEach(tab => {
          tab.style.background = '#f8f9fa';
          tab.style.color = '#000';
        });
        e.target.style.background = '#007bff';
        e.target.style.color = '#fff';
        
        showTabContent(e.target.dataset.tab);
      }
    });
    
    function showTabContent(tabName) {
      let html = '';
      
      if (tabName === 'errors') {
        html = '<h3>Errors</h3>';
        if (window.debugLogs.errors.length === 0) {
          html += '<p>No errors recorded</p>';
        } else {
          html += '<pre style="color: #dc3545">';
          window.debugLogs.errors.forEach(error => {
            html += `[${error.timestamp}] ${error.message}\n`;
            if (error.error) {
              html += `${error.error}\n\n`;
            }
          });
          html += '</pre>';
        }
      } else if (tabName === 'warnings') {
        html = '<h3>Warnings</h3>';
        if (window.debugLogs.warnings.length === 0) {
          html += '<p>No warnings recorded</p>';
        } else {
          html += '<pre style="color: #ffc107">';
          window.debugLogs.warnings.forEach(warning => {
            html += `[${warning.timestamp}] ${warning.message}\n`;
          });
          html += '</pre>';
        }
      } else if (tabName === 'logs') {
        html = '<h3>Logs</h3>';
        if (window.debugLogs.messages.length === 0) {
          html += '<p>No logs recorded</p>';
        } else {
          html += '<pre>';
          window.debugLogs.messages.forEach(log => {
            html += `[${log.timestamp}] ${log.message}\n`;
          });
          html += '</pre>';
        }
      } else if (tabName === 'components') {
        html = '<h3>Web Components</h3>';
        html += '<h4>Defined Components:</h4>';
        html += '<ul>';
        [
          'toast-container', 
          'loading-overlay', 
          'story-form', 
          'story-display', 
          'story-content', 
          'stories-grid', 
          'story-card', 
          'quiz-component', 
          'story-continuation'
        ].forEach(name => {
          const isDefined = customElements.get(name) !== undefined;
          html += `<li style="color: ${isDefined ? 'green' : 'red'}">${name}: ${isDefined ? 'Defined' : 'Not Defined'}</li>`;
        });
        html += '</ul>';
        
        // Add API test button
        html += '<h4>API Test:</h4>';
        html += '<button id="test-api-btn" style="padding: 8px 16px; background: #0275d8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 15px; margin-right: 10px;">Test API Connection</button>';
        html += '<button id="test-proxy-btn" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 15px;">Test via CORS Proxy</button>';
        html += '<div id="api-test-results" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;"></div>';
        
        // Add direct URL check after API test buttons are rendered
        setTimeout(() => {
          addDirectUrlCheck();
          addEndpointStructureCheck();
          addStoryGenerationTest();
          addServerConfigCheck();
        }, 200);
        
        // Show element tree of #generator-tab
        const generatorTab = document.getElementById('generator-tab');
        if (generatorTab) {
          html += '<h4>Generator Tab Content:</h4>';
          html += '<pre>';
          html += escapeHtml(generatorTab.outerHTML);
          html += '</pre>';
        }
      }
      
      content.innerHTML = html;
    }
    
    function escapeHtml(html) {
      return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    
    document.body.appendChild(panel);
    
    // Add event listeners to buttons
    setTimeout(() => {
      const testApiBtn = document.getElementById('test-api-btn');
      if (testApiBtn) {
        testApiBtn.addEventListener('click', async () => {
          const resultDiv = document.getElementById('api-test-results');
          resultDiv.innerHTML = '<p>Testing API connection...</p>';
          
          try {
            // Test base connection
            const basicTest = await window.apiService.testConnection();
            let html = `<p><strong>Basic connection:</strong> ${basicTest.ok ? '✅ Success' : '❌ Failed'}</p>`;
            
            // Try to fetch API status
            try {
              const status = await window.apiService.getStatus();
              html += `<p><strong>API Status:</strong> ${status ? '✅ Success' : '❌ Failed'}</p>`;
              html += `<pre>${JSON.stringify(status, null, 2)}</pre>`;
            } catch (error) {
              html += `<p><strong>API Status:</strong> ❌ Error</p>`;
              html += `<pre style="color: red">${error.message}</pre>`;
            }
            
            // Test story generation with minimal data
            try {
              html += `<p><strong>Testing Story Generation:</strong> Sending request...</p>`;
              const testData = {
                academic_grade: '5',
                subject: 'science',
                word_count: 300,
                language: 'English'
              };
              
              resultDiv.innerHTML = html + '<p>Waiting for API response...</p>';
              
              const story = await window.apiService.generateStory(testData);
              html += `<p><strong>Story Generation:</strong> ${story ? '✅ Success' : '❌ Failed'}</p>`;
              if (story) {
                html += `<p>Title: ${story.title || 'No title'}</p>`;
                html += `<p>Content: ${story.content ? (story.content.substring(0, 100) + '...') : 'No content'}</p>`;
              }
            } catch (error) {
              html += `<p><strong>Story Generation:</strong> ❌ Error</p>`;
              html += `<pre style="color: red">${error.message}</pre>`;
            }
            
            resultDiv.innerHTML = html;
          } catch (error) {
            resultDiv.innerHTML = `<p>Error testing API: ${error.message}</p>`;
          }
        });
      }
      
      // Add proxy test button handler
      const testProxyBtn = document.getElementById('test-proxy-btn');
      if (testProxyBtn) {
        testProxyBtn.addEventListener('click', async () => {
          const resultDiv = document.getElementById('api-test-results');
          
          if (!window.proxyService) {
            resultDiv.innerHTML = '<p style="color: red">❌ Error: Proxy service not available</p>';
            return;
          }
          
          resultDiv.innerHTML = '<p>Testing API via proxy...</p>';
          
          try {
            const baseUrl = window.ENV_API_URL || "https://easystory.onrender.com";
            
            // Test basic URL fetch
            try {
              const proxyTest = await window.proxyService.fetchViaProxy(baseUrl);
              let html = `<p><strong>Proxy basic connection:</strong> ✅ Success</p>`;
              if (typeof proxyTest === 'string') {
                html += `<p>Received HTML response (${proxyTest.length} chars)</p>`;
              } else {
                html += `<pre>${JSON.stringify(proxyTest).substring(0, 300)}...</pre>`;
              }
              
              // Try generating a story via proxy
              html += `<p><strong>Testing Story Generation via Proxy:</strong> Sending request...</p>`;
              resultDiv.innerHTML = html + '<p>Waiting for proxy response...</p>';
              
              const testData = {
                academic_grade: '5',
                subject: 'science',
                word_count: 300,
                language: 'English'
              };
              
              const story = await window.proxyService.generateStory(baseUrl, testData);
              html += `<p><strong>Proxy Story Generation:</strong> ${story ? '✅ Success' : '❌ Failed'}</p>`;
              if (story) {
                html += `<p>Title: ${story.title || 'No title'}</p>`;
                html += `<p>Content: ${story.content ? (story.content.substring(0, 100) + '...') : 'No content'}</p>`;
              }
              
              resultDiv.innerHTML = html;
            } catch (error) {
              resultDiv.innerHTML = `<p><strong>Proxy Test:</strong> ❌ Error</p>
                                    <pre style="color: red">${error.toString()}</pre>`;
            }
          } catch (error) {
            resultDiv.innerHTML = `<p>Error testing proxy: ${error.message}</p>`;
          }
        });
      }
    }, 100);
  }
  
  // Add global access to debug panel
  window.showDebugPanel = showDebugPanel;
  
  console.log('Debug helpers initialized - Press Ctrl+Shift+D to show debug panel');
})();

// Add a direct URL check function to the debug panel
function addDirectUrlCheck() {
  const apiTestResults = document.getElementById('api-test-results');
  if (!apiTestResults) return;

  const html = apiTestResults.innerHTML || '';
  
  apiTestResults.innerHTML = html + `
    <h4 style="margin-top: 15px;">Direct URL Check:</h4>
    <input id="direct-url-input" type="text" value="https://easystory.onrender.com/status" 
           style="width: 80%; padding: 8px; margin-right: 5px;">
    <button id="check-url-btn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Check URL</button>
    <div id="url-check-results" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;"></div>
  `;
  
  setTimeout(() => {
    const checkUrlBtn = document.getElementById('check-url-btn');
    const urlInput = document.getElementById('direct-url-input');
    const urlCheckResults = document.getElementById('url-check-results');
    
    if (checkUrlBtn && urlInput && urlCheckResults) {
      checkUrlBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
          urlCheckResults.innerHTML = '<p style="color: red">Please enter a URL</p>';
          return;
        }
        
        urlCheckResults.innerHTML = '<p>Checking URL...</p>';
        
        try {
          // Try three different fetch methods
          const results = [];
          
          // Method 1: Basic fetch with no CORS mode
          try {
            const basicResponse = await fetch(url, {
              method: 'GET', 
              cache: 'no-cache',
              headers: {'Content-Type': 'application/json'}
            }).catch(e => ({ ok: false, error: e }));
            
            results.push({
              method: 'Basic fetch (no CORS mode)',
              ok: basicResponse.ok !== false,
              status: basicResponse.status || 'Error',
              statusText: basicResponse.statusText || (basicResponse.error ? basicResponse.error.message : 'Unknown error')
            });
          } catch (error) {
            results.push({
              method: 'Basic fetch (no CORS mode)',
              ok: false,
              status: 'Error',
              statusText: error.message
            });
          }
          
          // Method 2: CORS mode
          try {
            const corsResponse = await fetch(url, {
              method: 'GET',
              mode: 'cors',
              cache: 'no-cache',
              headers: {'Content-Type': 'application/json'}
            }).catch(e => ({ ok: false, error: e }));
            
            results.push({
              method: 'CORS mode fetch',
              ok: corsResponse.ok !== false,
              status: corsResponse.status || 'Error',
              statusText: corsResponse.statusText || (corsResponse.error ? corsResponse.error.message : 'Unknown error')
            });
          } catch (error) {
            results.push({
              method: 'CORS mode fetch',
              ok: false,
              status: 'Error',
              statusText: error.message
            });
          }
          
          // Method 3: Via proxy
          if (window.proxyService) {
            try {
              await window.proxyService.fetchViaProxy(url);
              results.push({
                method: 'Proxy fetch',
                ok: true,
                status: 'Success',
                statusText: 'Connected via proxy'
              });
            } catch (error) {
              results.push({
                method: 'Proxy fetch',
                ok: false,
                status: 'Error',
                statusText: error.message
              });
            }
          }
          
          // Display results
          let resultHtml = '<h4>Connection Test Results:</h4><ul>';
          results.forEach(result => {
            resultHtml += `<li><strong>${result.method}:</strong> ${result.ok ? '✅' : '❌'} ${result.status} ${result.statusText}</li>`;
          });
          resultHtml += '</ul>';
          
          // If any method succeeded, try to show response
          const successMethod = results.find(r => r.ok);
          if (successMethod) {
            resultHtml += '<h4>Response Content:</h4>';
            try {
              let response;
              if (successMethod.method === 'Proxy fetch') {
                response = await window.proxyService.fetchViaProxy(url);
              } else {
                const fetchResponse = await fetch(url, {
                  method: 'GET',
                  mode: successMethod.method.includes('CORS') ? 'cors' : undefined,
                  cache: 'no-cache'
                });
                
                const contentType = fetchResponse.headers.get('Content-Type') || '';
                if (contentType.includes('application/json')) {
                  response = await fetchResponse.json();
                } else {
                  response = await fetchResponse.text();
                }
              }
              
              if (typeof response === 'string') {
                resultHtml += `<pre style="max-height: 200px; overflow: auto;">${response.substring(0, 500)}${response.length > 500 ? '...' : ''}</pre>`;
              } else {
                resultHtml += `<pre style="max-height: 200px; overflow: auto;">${JSON.stringify(response, null, 2)}</pre>`;
              }
            } catch (error) {
              resultHtml += `<p>Error getting response content: ${error.message}</p>`;
            }
          } else {
            resultHtml += '<p>❌ All connection methods failed. The endpoint might be:</p>';
            resultHtml += '<ul>';
            resultHtml += '<li>Unavailable or down</li>';
            resultHtml += '<li>Blocking cross-origin requests (CORS issues)</li>';
            resultHtml += '<li>Rejecting your IP address</li>';
            resultHtml += '<li>Requiring authentication</li>';
            resultHtml += '</ul>';
            resultHtml += '<p>Try accessing the URL directly in a new browser tab to see if it\'s available.</p>';
          }
          
          urlCheckResults.innerHTML = resultHtml;
        } catch (error) {
          urlCheckResults.innerHTML = `<p>Error testing URL: ${error.message}</p>`;
        }
      });
    }
  }, 100);
}

// Function to check API endpoints structure
function addEndpointStructureCheck() {
  const apiTestResults = document.getElementById('api-test-results');
  if (!apiTestResults) return;
  
  const html = apiTestResults.innerHTML || '';
  
  apiTestResults.innerHTML = html + `
    <h4 style="margin-top: 15px;">API Endpoints Structure Check:</h4>
    <button id="check-endpoints-btn" style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">Check API Endpoints</button>
    <div id="endpoints-check-results" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;"></div>
  `;
  
  setTimeout(() => {
    const checkEndpointsBtn = document.getElementById('check-endpoints-btn');
    const endpointsCheckResults = document.getElementById('endpoints-check-results');
    
    if (checkEndpointsBtn && endpointsCheckResults) {
      checkEndpointsBtn.addEventListener('click', async () => {
        endpointsCheckResults.innerHTML = '<p>Checking API endpoints structure...</p>';
        
        const baseUrl = window.ENV_API_URL || "https://easystory.onrender.com";
        
        // Define endpoints to check
        const endpoints = [
          { path: '/', method: 'GET', name: 'Root endpoint' },
          { path: '/status', method: 'GET', name: 'Status endpoint' },
          { path: '/stories', method: 'GET', name: 'Stories list endpoint' },
          { path: '/stories/generate', method: 'POST', name: 'Story generation endpoint' },
        ];
        
        // Check each endpoint
        const results = [];
        
        for (const endpoint of endpoints) {
          try {
            // Try direct access first
            let response = await fetch(`${baseUrl}${endpoint.path}`, {
              method: endpoint.method,
              mode: 'cors',
              headers: { 'Content-Type': 'application/json' }
            }).catch(() => null);
            
            // If direct access fails, try via proxy
            if (!response && window.proxyService) {
              try {
                await window.proxyService.fetchViaProxy(`${baseUrl}${endpoint.path}`);
                results.push({
                  endpoint: endpoint.name,
                  path: endpoint.path,
                  exists: true,
                  status: 'Unknown (via proxy)',
                  method: 'Proxy'
                });
                continue;
              } catch {
                // Proxy also failed
              }
            }
            
            if (response) {
              results.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                exists: true,
                status: response.status,
                method: 'Direct'
              });
            } else {
              results.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                exists: false,
                status: 'Failed',
                method: 'All methods'
              });
            }
          } catch (error) {
            results.push({
              endpoint: endpoint.name,
              path: endpoint.path,
              exists: false,
              status: 'Error',
              error: error.message
            });
          }
        }
        
        // Display results
        let resultHtml = '<h4>API Endpoints Results:</h4>';
        resultHtml += '<table style="width: 100%; border-collapse: collapse;">';
        resultHtml += '<tr><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Endpoint</th><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Path</th><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Status</th></tr>';
        
        results.forEach(result => {
          resultHtml += `<tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${result.endpoint}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${result.path}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: ${result.exists ? 'green' : 'red'}">
              ${result.exists ? '✅' : '❌'} ${result.status} (${result.method})
            </td>
          </tr>`;
        });
        
        resultHtml += '</table>';
        
        // Add recommendations based on results
        resultHtml += '<h4>Recommendations:</h4>';
        
        if (results.every(r => !r.exists)) {
          resultHtml += `<p>❌ None of the API endpoints could be reached. This suggests:</p>
          <ul>
            <li>The API server at <strong>${baseUrl}</strong> might be down</li>
            <li>The server might be in sleep mode (common with free Render.com instances)</li>
            <li>The base URL might be incorrect</li>
            <li>Strong CORS restrictions might be preventing all access</li>
          </ul>
          <p>Try opening <a href="${baseUrl}" target="_blank">${baseUrl}</a> directly in your browser to see if the server responds at all.</p>`;
        } else if (results.find(r => r.path === '/stories/generate' && !r.exists)) {
          resultHtml += `<p>⚠️ The story generation endpoint doesn't seem to be available. This suggests:</p>
          <ul>
            <li>The API might use a different endpoint structure than expected</li>
            <li>The endpoint might require authentication</li>
            <li>The endpoint might only accept specific request formats</li>
          </ul>
          <p>Check the API documentation to confirm the correct endpoint for story generation.</p>`;
        } else if (results.find(r => r.method === 'Proxy' && r.exists)) {
          resultHtml += `<p>⚠️ Some endpoints are only accessible via proxy. This confirms a CORS issue with the API.</p>
          <p>The application should continue working via the proxy service, but for better performance, the API server should be configured to allow CORS requests from your domain.</p>`;
        }
        
        endpointsCheckResults.innerHTML = resultHtml;
      });
    }
  }, 100);
}

// Function to test story generation endpoint
function addStoryGenerationTest() {
  const apiTestResults = document.getElementById('api-test-results');
  if (!apiTestResults) return;
  
  const html = apiTestResults.innerHTML || '';
  
  apiTestResults.innerHTML = html + `
    <h4 style="margin-top: 15px;">Story Generation Test:</h4>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
      <div style="flex: 1; min-width: 200px;">
        <label style="display: block; margin-bottom: 5px;">Academic Grade:</label>
        <select id="test-grade" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ced4da;">
          <option value="5">Grade 5</option>
          <option value="8">Grade 8</option>
          <option value="12">Grade 12</option>
        </select>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <label style="display: block; margin-bottom: 5px;">Subject:</label>
        <select id="test-subject" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ced4da;">
          <option value="science">Science</option>
          <option value="history">History</option>
          <option value="literature">Literature</option>
          <option value="mathematics">Mathematics</option>
        </select>
      </div>
    </div>
    <button id="test-story-gen-btn" style="padding: 8px 16px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;">Test Story Generation</button>
    <div id="story-gen-results" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;"></div>
  `;
  
  setTimeout(() => {
    const testBtn = document.getElementById('test-story-gen-btn');
    const resultsDiv = document.getElementById('story-gen-results');
    const gradeSelect = document.getElementById('test-grade');
    const subjectSelect = document.getElementById('test-subject');
    
    if (testBtn && resultsDiv) {
      testBtn.addEventListener('click', async () => {
        resultsDiv.innerHTML = '<p>Testing story generation...</p>';
        
        const baseUrl = window.ENV_API_URL || "https://easystory.onrender.com";
        const endpoint = `${baseUrl}/stories/generate`;
        
        // Prepare test data
        const testData = {
          academic_grade: gradeSelect?.value || '5',
          subject: subjectSelect?.value || 'science',
          word_count: 300,
          language: 'English'
        };
        
        // Log the test attempt
        console.log('Debug: Testing story generation with data:', testData);
        
        // Results storage
        const results = {
          directPost: null,
          directGet: null,
          proxyPost: null,
          proxyGet: null
        };
        
        // Helper function to format duration
        const formatDuration = (start) => {
          const duration = Date.now() - start;
          return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
        };
        
        try {
          // 1. Try direct POST
          const postStart = Date.now();
          try {
            const postResponse = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              mode: 'cors',
              body: JSON.stringify(testData)
            }).catch(e => ({ ok: false, error: e }));
            
            if (postResponse.ok) {
              results.directPost = {
                success: true,
                data: await postResponse.json(),
                duration: formatDuration(postStart)
              };
            } else {
              results.directPost = {
                success: false,
                status: postResponse.status,
                statusText: postResponse.statusText || (postResponse.error ? postResponse.error.message : 'Unknown error'),
                duration: formatDuration(postStart)
              };
            }
          } catch (error) {
            results.directPost = {
              success: false,
              error: error.message,
              duration: formatDuration(postStart)
            };
          }
          
          // 2. Try direct GET with params (if POST failed)
          if (!results.directPost?.success) {
            const getStart = Date.now();
            try {
              const params = new URLSearchParams();
              Object.entries(testData).forEach(([key, value]) => {
                params.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
              });
              
              const getUrl = `${endpoint}?${params.toString()}`;
              const getResponse = await fetch(getUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors'
              }).catch(e => ({ ok: false, error: e }));
              
              if (getResponse.ok) {
                results.directGet = {
                  success: true,
                  data: await getResponse.json(),
                  duration: formatDuration(getStart)
                };
              } else {
                results.directGet = {
                  success: false,
                  status: getResponse.status,
                  statusText: getResponse.statusText || (getResponse.error ? getResponse.error.message : 'Unknown error'),
                  duration: formatDuration(getStart)
                };
              }
            } catch (error) {
              results.directGet = {
                success: false,
                error: error.message,
                duration: formatDuration(getStart)
              };
            }
          }
          
          // 3. Try proxy POST (if both direct methods failed)
          if ((!results.directPost?.success && !results.directGet?.success) && window.proxyService) {
            const proxyPostStart = Date.now();
            try {
              const story = await window.proxyService.generateStory(baseUrl, testData);
              results.proxyPost = {
                success: true,
                data: story,
                duration: formatDuration(proxyPostStart)
              };
            } catch (error) {
              results.proxyPost = {
                success: false,
                error: error.message,
                duration: formatDuration(proxyPostStart)
              };
            }
          }
          
          // Display results
          let resultHtml = '<h4>Story Generation Results:</h4>';
          
          // Create a table of results
          resultHtml += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">';
          resultHtml += '<tr><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Method</th><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Result</th><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Time</th></tr>';
          
          if (results.directPost) {
            resultHtml += `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Direct POST</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: ${results.directPost.success ? 'green' : 'red'}">
                ${results.directPost.success ? '✅ Success' : '❌ Failed'} ${results.directPost.status || ''} ${results.directPost.error || ''}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${results.directPost.duration}</td>
            </tr>`;
          }
          
          if (results.directGet) {
            resultHtml += `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Direct GET</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: ${results.directGet.success ? 'green' : 'red'}">
                ${results.directGet.success ? '✅ Success' : '❌ Failed'} ${results.directGet.status || ''} ${results.directGet.error || ''}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${results.directGet.duration}</td>
            </tr>`;
          }
          
          if (results.proxyPost) {
            resultHtml += `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Proxy</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: ${results.proxyPost.success ? 'green' : 'red'}">
                ${results.proxyPost.success ? '✅ Success' : '❌ Failed'} ${results.proxyPost.error || ''}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${results.proxyPost.duration}</td>
            </tr>`;
          }
          
          resultHtml += '</table>';
          
          // Display request data
          resultHtml += '<h4>Request Data:</h4>';
          resultHtml += `<pre style="max-height: 100px; overflow: auto; background: #f5f5f5; padding: 8px; border-radius: 4px;">${JSON.stringify(testData, null, 2)}</pre>`;
          
          // If any method was successful, show the response
          const successResult = results.directPost?.success ? results.directPost :
                              results.directGet?.success ? results.directGet :
                              results.proxyPost?.success ? results.proxyPost : null;
          
          if (successResult) {
            resultHtml += '<h4>Response Data:</h4>';
            resultHtml += `<pre style="max-height: 200px; overflow: auto; background: #f5f5f5; padding: 8px; border-radius: 4px;">${JSON.stringify(successResult.data, null, 2)}</pre>`;
            
            // Show some diagnostics about the story
            if (successResult.data) {
              const story = successResult.data;
              resultHtml += '<h4>Story Diagnostics:</h4>';
              resultHtml += '<ul>';
              
              if (story.title) resultHtml += `<li><strong>Title:</strong> ${story.title}</li>`;
              if (story.content) {
                const contentLength = story.content.length;
                const wordCount = story.content.split(/\s+/).length;
                resultHtml += `<li><strong>Content Length:</strong> ${contentLength} characters, ~${wordCount} words</li>`;
              }
              if (story.created_at) resultHtml += `<li><strong>Created At:</strong> ${story.created_at}</li>`;
              
              resultHtml += '</ul>';
            }
          } else {
            resultHtml += '<p>❌ All story generation methods failed. Possible reasons:</p>';
            resultHtml += '<ul>';
            resultHtml += '<li>The API server may be down or unreachable</li>';
            resultHtml += '<li>The story generation endpoint URL might be incorrect</li>';
            resultHtml += '<li>The API might require authentication</li>';
            resultHtml += '<li>The request format might be incorrect</li>';
            resultHtml += '</ul>';
            
            resultHtml += '<p>Try checking the API documentation or contacting the API provider.</p>';
          }
          
          resultsDiv.innerHTML = resultHtml;
        } catch (error) {
          resultsDiv.innerHTML = `<p>Error testing story generation: ${error.message}</p>`;
        }
      });
    }
  }, 100);
}

// Function to check server configuration
function addServerConfigCheck() {
  const apiTestResults = document.getElementById('api-test-results');
  if (!apiTestResults) return;
  
  const html = apiTestResults.innerHTML || '';
  
  apiTestResults.innerHTML = html + `
    <h4 style="margin-top: 15px;">Server Configuration Check:</h4>
    <button id="check-server-btn" style="padding: 8px 16px; background: #6610f2; color: white; border: none; border-radius: 4px; cursor: pointer;">Check Server Configuration</button>
    <div id="server-config-results" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;"></div>
  `;
  
  setTimeout(() => {
    const checkBtn = document.getElementById('check-server-btn');
    const configResults = document.getElementById('server-config-results');
    
    if (checkBtn && configResults) {
      checkBtn.addEventListener('click', async () => {
        configResults.innerHTML = '<p>Checking server configuration...</p>';
        
        const baseUrl = window.ENV_API_URL || "https://easystory.onrender.com";
        
        try {
          // Check common issues with server configuration
          const checks = [
            { 
              name: 'Server existence', 
              description: 'Checks if the server exists and responds to requests',
              test: async () => {
                try {
                  const response = await fetch(baseUrl, { 
                    method: 'GET',
                    mode: 'no-cors' // This will succeed even if CORS is misconfigured
                  });
                  
                  // Even with no-cors, we should get some kind of response
                  return { 
                    status: 'success',
                    message: 'Server exists and responds to requests' 
                  };
                } catch (error) {
                  return { 
                    status: 'failed',
                    message: `Server does not respond: ${error.message}` 
                  };
                }
              }
            },
            {
              name: 'CORS Headers',
              description: 'Checks if the server is configured with proper CORS headers',
              test: async () => {
                try {
                  const response = await fetch(baseUrl, {
                    method: 'OPTIONS',
                    headers: {
                      'Access-Control-Request-Method': 'POST',
                      'Access-Control-Request-Headers': 'Content-Type',
                      'Origin': window.location.origin
                    }
                  });
                  
                  const corsHeaders = {
                    'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                    'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                    'access-control-allow-headers': response.headers.get('access-control-allow-headers')
                  };
                  
                  const hasCorsHeaders = corsHeaders['access-control-allow-origin'] !== null;
                  
                  return {
                    status: hasCorsHeaders ? 'success' : 'warning',
                    message: hasCorsHeaders ? 'Server has CORS headers configured' : 'Server is missing CORS headers',
                    details: corsHeaders
                  };
                } catch (error) {
                  return {
                    status: 'warning',
                    message: `Could not check CORS headers: ${error.message}`
                  };
                }
              }
            },
            {
              name: 'API Validity',
              description: 'Checks if the server appears to be a valid API',
              test: async () => {
                try {
                  // Try to access common API endpoints
                  const endpoints = ['/status', '/health', '/api', '/api/v1', '/stories'];
                  
                  for (const endpoint of endpoints) {
                    try {
                      const response = await fetch(`${baseUrl}${endpoint}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        mode: 'cors'
                      });
                      
                      if (response.ok) {
                        return {
                          status: 'success',
                          message: `Found valid API endpoint: ${endpoint}`,
                          details: { endpoint }
                        };
                      }
                    } catch (e) {
                      // Continue checking other endpoints
                    }
                  }
                  
                  return {
                    status: 'warning',
                    message: 'Could not find any standard API endpoints'
                  };
                } catch (error) {
                  return {
                    status: 'warning',
                    message: `Could not check API validity: ${error.message}`
                  };
                }
              }
            },
            {
              name: 'Content check',
              description: 'Checks what type of content the server returns',
              test: async () => {
                try {
                  const response = await fetch(baseUrl, {
                    method: 'GET',
                    mode: 'no-cors'
                  });
                  
                  // In no-cors mode, we can't access the content directly
                  // But we can check the type
                  const contentType = response.headers.get('Content-Type') || '';
                  
                  if (contentType.includes('text/html')) {
                    return {
                      status: 'warning',
                      message: 'Server appears to be returning HTML, not a JSON API',
                      details: { contentType }
                    };
                  } else if (contentType.includes('application/json')) {
                    return {
                      status: 'success',
                      message: 'Server is correctly returning JSON content',
                      details: { contentType }
                    };
                  } else {
                    return {
                      status: 'info',
                      message: `Server is returning content of type: ${contentType}`,
                      details: { contentType }
                    };
                  }
                } catch (error) {
                  // If we can't do a no-cors fetch, try via proxy
                  if (window.proxyService) {
                    try {
                      const content = await window.proxyService.fetchViaProxy(baseUrl);
                      const isHtml = typeof content === 'string' && content.trim().startsWith('<!DOCTYPE html');
                      const seemsLikeJson = typeof content === 'object';
                      
                      if (isHtml) {
                        return {
                          status: 'warning',
                          message: 'Server appears to be a website, not a JSON API',
                          details: { firstChars: typeof content === 'string' ? content.substring(0, 50) : 'N/A' }
                        };
                      } else if (seemsLikeJson) {
                        return {
                          status: 'success',
                          message: 'Server appears to be a JSON API',
                          details: { content: JSON.stringify(content).substring(0, 50) + '...' }
                        };
                      }
                    } catch (e) {
                      // Proxy also failed
                    }
                  }
                  
                  return {
                    status: 'warning',
                    message: `Could not check content type: ${error.message}`
                  };
                }
              }
            }
          ];
          
          // Run all checks
          const results = [];
          for (const check of checks) {
            try {
              results.push({
                name: check.name,
                description: check.description,
                result: await check.test()
              });
            } catch (error) {
              results.push({
                name: check.name,
                description: check.description,
                result: {
                  status: 'error',
                  message: `Check failed: ${error.message}`
                }
              });
            }
          }
          
          // Display results
          let resultHtml = '<h4>Configuration Check Results:</h4>';
          resultHtml += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">';
          resultHtml += '<tr><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Check</th><th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Result</th></tr>';
          
          results.forEach(result => {
            const statusColor = result.result.status === 'success' ? 'green' : 
                              result.result.status === 'warning' ? 'orange' :
                              result.result.status === 'info' ? 'blue' : 'red';
            
            const statusIcon = result.result.status === 'success' ? '✅' :
                             result.result.status === 'warning' ? '⚠️' :
                             result.result.status === 'info' ? 'ℹ️' : '❌';
            
            resultHtml += `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <strong>${result.name}</strong><br>
                <small>${result.description}</small>
              </td>
              <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor}">
                ${statusIcon} ${result.result.message}
                ${result.result.details ? `<br><small>${JSON.stringify(result.result.details)}</small>` : ''}
              </td>
            </tr>`;
          });
          
          resultHtml += '</table>';
          
          // Add conclusion and recommendations
          resultHtml += '<h4>Conclusion:</h4>';
          
          // Check if server exists but may be misconfigured
          const serverExists = results.find(r => r.name === 'Server existence')?.result.status === 'success';
          const corsIssue = results.find(r => r.name === 'CORS Headers')?.result.status !== 'success';
          const invalidApi = results.find(r => r.name === 'API Validity')?.result.status !== 'success';
          const contentTypeIssue = results.find(r => r.name === 'Content check')?.result.status === 'warning';
          
          if (serverExists && (corsIssue || invalidApi || contentTypeIssue)) {
            resultHtml += `<p>⚠️ <strong>The server at ${baseUrl} exists but appears to be misconfigured.</strong></p>`;
            
            if (corsIssue) {
              resultHtml += `<p>The server is not properly configured for CORS, which is preventing browser access.</p>`;
              resultHtml += `<p>Possible solutions:</p>
              <ul>
                <li>Configure the server to add the following headers to responses:
                  <pre>Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type</pre>
                </li>
                <li>Continue using the proxy service in your application as a workaround</li>
              </ul>`;
            }
            
            if (contentTypeIssue) {
              resultHtml += `<p>The server appears to be returning HTML instead of JSON. This suggests it might be:</p>
              <ul>
                <li>A website instead of an API</li>
                <li>An API that's returning error pages</li>
                <li>A server that's redirecting to a login page</li>
              </ul>`;
            }
            
            if (invalidApi) {
              resultHtml += `<p>The server doesn't appear to have common API endpoints. It might be:</p>
              <ul>
                <li>A different type of service than expected</li>
                <li>An API with non-standard endpoint structure</li>
                <li>An API that requires authentication for all endpoints</li>
              </ul>`;
            }
          } else if (!serverExists) {
            resultHtml += `<p>❌ <strong>The server at ${baseUrl} does not appear to exist or is completely unreachable.</strong></p>`;
            resultHtml += `<p>Possible issues:</p>
            <ul>
              <li>The URL is incorrect</li>
              <li>The server is down or not running</li>
              <li>There's a network issue preventing all connections</li>
            </ul>`;
          } else {
            resultHtml += `<p>✅ <strong>The server at ${baseUrl} appears to be properly configured.</strong></p>`;
            resultHtml += `<p>If you're still experiencing issues, check:</p>
            <ul>
              <li>Authentication requirements</li>
              <li>Specific endpoint paths</li>
              <li>Request payload format</li>
            </ul>`;
          }
          
          configResults.innerHTML = resultHtml;
        } catch (error) {
          configResults.innerHTML = `<p>Error checking server configuration: ${error.message}</p>`;
        }
      });
    }
  }, 100);
} 