/**
 * Simplified Debug Panel for EasyStory
 * A lightweight tool for troubleshooting runtime issues
 */

(function() {
  // Store the original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };

  // Storage for logs
  const logs = {
    messages: [],
    warnings: [],
    errors: []
  };

  // Maximum number of logs to keep
  const MAX_LOGS = 100;

  // Initialize debug panel
  function initDebugPanel() {
    // Override console methods to capture logs
    overrideConsoleMethods();
    
    // Add error listeners
    addErrorListeners();
    
    // Make functions available globally
    window.showDebugPanel = showDebugPanel;
    window.initDebugPanel = initDebugPanel;
    window.clearDebugLogs = clearLogs;
    
    console.log("Debug panel initialized");
  }

  // Override console methods to capture logs
  function overrideConsoleMethods() {
  console.log = function() {
    const args = Array.from(arguments);
      logs.messages.push({
        time: new Date().toISOString(),
        content: formatLogContent(args)
      });
      
      // Trim logs if they exceed the maximum
      if (logs.messages.length > MAX_LOGS) {
        logs.messages.shift();
      }
      
      // Call the original method
      originalConsole.log.apply(console, arguments);
    };

    console.warn = function() {
    const args = Array.from(arguments);
      logs.warnings.push({
        time: new Date().toISOString(),
        content: formatLogContent(args)
      });
      
      if (logs.warnings.length > MAX_LOGS) {
        logs.warnings.shift();
      }
      
      originalConsole.warn.apply(console, arguments);
    };

    console.error = function() {
    const args = Array.from(arguments);
      logs.errors.push({
        time: new Date().toISOString(),
        content: formatLogContent(args)
      });
      
      if (logs.errors.length > MAX_LOGS) {
        logs.errors.shift();
      }
      
      originalConsole.error.apply(console, arguments);
    };
  }

  // Add listeners for runtime errors
  function addErrorListeners() {
    // Global error handler
  window.addEventListener('error', function(event) {
      logs.errors.push({
        time: new Date().toISOString(),
        content: `${event.message} at ${event.filename}:${event.lineno}`,
        stack: event.error ? event.error.stack : undefined
    });
  });
  
    // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
      logs.errors.push({
        time: new Date().toISOString(),
        content: 'Unhandled Promise Rejection',
        stack: event.reason ? (event.reason.stack || event.reason.toString()) : 'Unknown reason'
    });
  });
  }

  // Format log content for display
  function formatLogContent(args) {
    return args.map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return Object.prototype.toString.call(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  // Clear all logs
  function clearLogs() {
    logs.messages = [];
    logs.warnings = [];
    logs.errors = [];
    console.log("Debug logs cleared");
  }

  // Show the debug panel
function showDebugPanel() {
    // Remove existing panel if it exists
  const existingPanel = document.getElementById('debug-panel');
  if (existingPanel) {
    existingPanel.remove();
    return;
  }
  
    // Create panel container
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.style.cssText = `
    position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
    background: #fff;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
    z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: monospace;
      font-size: 13px;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 10px 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Debug Panel';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      width: 30px;
      height: 30px;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    closeBtn.onclick = () => panel.remove();

    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Create tabs
  const tabs = document.createElement('div');
  tabs.style.cssText = `
    display: flex;
      background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  `;
  
    const tabNames = ['Errors', 'Warnings', 'Logs', 'Environment'];
    let activeTab = 'Errors';
    
    tabNames.forEach(name => {
    const tab = document.createElement('div');
      tab.className = 'debug-tab';
      tab.textContent = name;
      tab.dataset.tab = name.toLowerCase();
    tab.style.cssText = `
      padding: 10px 15px;
      cursor: pointer;
        ${name === activeTab ? 'background: #007bff; color: white;' : ''}
      `;
      
      tab.onclick = () => {
        document.querySelectorAll('.debug-tab').forEach(t => {
          t.style.background = '';
          t.style.color = '';
        });
        tab.style.background = '#007bff';
        tab.style.color = 'white';
        showTabContent(name.toLowerCase());
      };
      
      tabs.appendChild(tab);
    });
  
  panel.appendChild(tabs);
  
  // Create content area
  const content = document.createElement('div');
    content.id = 'debug-content';
  content.style.cssText = `
      flex: 1;
    overflow: auto;
      padding: 10px;
    background: #f8f9fa;
      white-space: pre-wrap;
  `;
  panel.appendChild(content);
  
    // Create footer with actions
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 10px;
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    `;
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Logs';
    clearBtn.style.cssText = `
    padding: 5px 10px;
      background: #6c757d;
      color: white;
    border: none;
      border-radius: 4px;
    cursor: pointer;
    `;
    clearBtn.onclick = () => {
      clearLogs();
      showTabContent(activeTab.toLowerCase());
    };
    
    footer.appendChild(clearBtn);
    panel.appendChild(footer);

    // Add panel to document
    document.body.appendChild(panel);

    // Function to display content for selected tab
  function showTabContent(tabName) {
      activeTab = tabName;
    let html = '';
    
    switch(tabName) {
      case 'errors':
          if (logs.errors.length === 0) {
            html = '<p>No errors recorded</p>';
        } else {
            logs.errors.forEach(log => {
              html += `<div style="margin-bottom: 10px; color: #dc3545;">
                <strong>[${log.time}]</strong> ${log.content}
                ${log.stack ? `<div style="margin-top: 5px; margin-left: 20px; color: #666;">${log.stack}</div>` : ''}
              </div>`;
            });
        }
        break;
        
      case 'warnings':
          if (logs.warnings.length === 0) {
            html = '<p>No warnings recorded</p>';
        } else {
            logs.warnings.forEach(log => {
              html += `<div style="margin-bottom: 10px; color: #fd7e14;">
                <strong>[${log.time}]</strong> ${log.content}
              </div>`;
            });
        }
        break;
        
      case 'logs':
          if (logs.messages.length === 0) {
            html = '<p>No logs recorded</p>';
        } else {
            logs.messages.forEach(log => {
              html += `<div style="margin-bottom: 10px;">
                <strong>[${log.time}]</strong> ${log.content}
              </div>`;
            });
        }
        break;
        
      case 'environment':
          html = '<h4>Environment Variables</h4><div style="margin-left: 20px;">';
          
          // Extract environment variables from window object
          Object.keys(window)
          .filter(key => key.startsWith('ENV_'))
            .forEach(key => {
              const value = typeof window[key] === 'object' 
                ? JSON.stringify(window[key], null, 2)
                : window[key];
                
              html += `<div style="margin-bottom: 5px;">
                <strong>${key}:</strong> ${value}
              </div>`;
            });
            
          html += '</div>';
          
          html += '<h4>Browser Information</h4><div style="margin-left: 20px;">';
          html += `<div><strong>User Agent:</strong> ${navigator.userAgent}</div>`;
          html += `<div><strong>Platform:</strong> ${navigator.platform}</div>`;
          html += `<div><strong>Language:</strong> ${navigator.language}</div>`;
          html += '</div>';
          
          break;
      }
      
      content.innerHTML = html;
      content.scrollTop = content.scrollHeight;
    }

    // Show initial content
    showTabContent(activeTab);
  }

  // Initialize on load if not already initialized
  if (typeof window.showDebugPanel !== 'function') {
    initDebugPanel();
  }

  // Add debug function for components
  window.debugComponents = function() {
    const componentStatus = {
      'story-continuation': {
        registered: !!customElements.get('story-continuation'),
        instance: document.querySelector('story-continuation'),
        container: document.querySelector('#storyContinuationContainer')
      },
      'continuation-form': {
        registered: !!customElements.get('continuation-form'),
        instance: document.querySelector('continuation-form')
      },
      'difficulty-selector': {
        registered: !!customElements.get('difficulty-selector'),
        instance: document.querySelector('difficulty-selector')
      },
      'difficulty-description': {
        registered: !!customElements.get('difficulty-description'),
        instance: document.querySelector('difficulty-description')
      }
    };

    console.group('Component Debug Information');
    
    console.log('Component Registration Status:');
    Object.entries(componentStatus).forEach(([name, info]) => {
      console.log(`${name}: ${info.registered ? '✅ Registered' : '❌ Not registered'}`);
      if (info.instance) {
        console.log(`  - Instance found: ${info.instance.tagName}`);
      } else {
        console.log(`  - No instances in DOM`);
      }
      
      if (info.container) {
        console.log(`  - Container: ${info.container.tagName}, innerHTML: ${info.container.innerHTML.substring(0, 100)}...`);
      }
    });

    // Check story in window
    console.log('Current Story:', window.currentStory ? 
      `ID: ${window.currentStory.id}, Content length: ${window.currentStory.content?.length || 0}` : 
      'Not available');
    
    // Check continuation container
    const continuationContainer = document.getElementById('continuation-container');
    if (continuationContainer) {
      console.log('Continuation container:', {
        display: continuationContainer.style.display,
        visibility: window.getComputedStyle(continuationContainer).visibility,
        children: continuationContainer.children.length
      });
    } else {
      console.log('Continuation container not found');
    }

    console.groupEnd();
    
    return componentStatus;
  };

  // Add the debug command to window to make it available in the console
  window.debugCommands = window.debugCommands || {};
  window.debugCommands.components = window.debugComponents;

  // Auto run on continue button click
  document.addEventListener('click', (event) => {
    if (event.target.closest('.quiz-continue-button, .continue-button')) {
      setTimeout(() => {
        console.log('Auto-running component debug after continue button click:');
        window.debugComponents();
      }, 500);
    }
  });

  // Add network request monitoring for script loading
  window.monitorScriptLoading = function() {
    console.log('Monitoring script loading...');
    
    // Monitor which scripts are actually loaded
    const originalFetch = window.fetch;
    window.fetch = function() {
      console.log('Fetch request:', arguments[0]);
      return originalFetch.apply(this, arguments);
    };
    
    // Also monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
      console.log('XHR request:', arguments[1]);
      return originalXHROpen.apply(this, arguments);
    };
    
    // Log script tags
    const scripts = document.querySelectorAll('script[src]');
    console.log('Script tags in document:', Array.from(scripts).map(s => s.src));
    
    // Check for component imports
    console.log('Checking for component scripts:');
    const continuationFiles = [
      '/components/continuation/difficulty-selector.js',
      '/components/continuation/difficulty-description.js',
      '/components/continuation/vocabulary-display.js',
      '/components/continuation/continuation-form.js',
      '/components/continuation/continuation-result.js',
      '/components/continuation/error-message.js'
    ];
    
    continuationFiles.forEach(file => {
      // Create a probe request to check if the file exists and is accessible
      fetch(file, { method: 'HEAD' })
        .then(resp => {
          console.log(`File ${file}: ${resp.ok ? '✅ Exists' : '❌ Not found'} (${resp.status})`);
        })
        .catch(err => {
          console.error(`Error checking ${file}:`, err);
        });
    });
  };

  // Call monitoring on page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.monitorScriptLoading();
    }, 2000);
  });

  // Add the debug command to window
  window.debugCommands = window.debugCommands || {};
  window.debugCommands.monitorScripts = window.monitorScriptLoading;
})(); 