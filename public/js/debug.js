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
  }
  
  // Add global access to debug panel
  window.showDebugPanel = showDebugPanel;
  
  console.log('Debug helpers initialized - Press Ctrl+Shift+D to show debug panel');
})(); 