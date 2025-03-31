#!/usr/bin/env node

/**
 * Update HTML Dependencies
 * 
 * This script ensures that the index.html has the correct order of script imports
 * to prevent dependency resolution issues.
 */

const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuration
const config = {
  INDEX_HTML: 'public/index.html',
  COMPONENT_LOADER: 'js/component-loader.js',
  CDN_IMPORTS: [
    '<script type="module" src="https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"></script>'
  ],
  UTILITY_SCRIPTS: [
    '<script type="module" src="js/api.js"></script>',
    '<script type="module" src="js/utils.js"></script>',
    '<script type="module" src="components/toast-container.js"></script>',
    '<script type="module" src="components/loading-overlay.js"></script>'
  ],
  COMPONENT_SCRIPTS: [
    // Base components
    '<script type="module" src="components/form/form-settings-card.js"></script>',
    '<script type="module" src="components/form/form-input-group.js"></script>',
    '<script type="module" src="components/form/form-grid.js"></script>',
    '<script type="module" src="components/form/form-checkbox-options.js"></script>',
    '<script type="module" src="components/form/submit-button.js"></script>',
    
    // Story components
    '<script type="module" src="components/story/story-header.js"></script>',
    '<script type="module" src="components/story/story-text.js"></script>',
    '<script type="module" src="components/story/story-summary.js"></script>',
    '<script type="module" src="components/story/story-vocabulary.js"></script>',
    '<script type="module" src="components/story/story-quiz.js"></script>',
    
    // Continuation components
    '<script type="module" src="components/continuation/difficulty-selector.js"></script>',
    '<script type="module" src="components/continuation/difficulty-description.js"></script>',
    '<script type="module" src="components/continuation/vocabulary-display.js"></script>',
    '<script type="module" src="components/continuation/continuation-form.js"></script>',
    '<script type="module" src="components/continuation/continuation-result.js"></script>',
    '<script type="module" src="components/continuation/error-message.js"></script>',
    
    // Grid components
    '<script type="module" src="components/grid/grid-loading.js"></script>',
    '<script type="module" src="components/grid/grid-error.js"></script>',
    '<script type="module" src="components/grid/grid-empty-state.js"></script>',
    '<script type="module" src="components/grid/story-item.js"></script>',
    '<script type="module" src="components/grid/refresh-button.js"></script>',
    
    // Quiz components
    '<script type="module" src="components/quiz/quiz-option.js"></script>',
    '<script type="module" src="components/quiz/quiz-question.js"></script>',
    '<script type="module" src="components/quiz/quiz-results.js"></script>',
    
    // Main refactored components
    '<script type="module" src="components/story-form-refactored.js"></script>',
    '<script type="module" src="components/story-content-refactored.js"></script>',
    '<script type="module" src="components/story-continuation-refactored.js"></script>',
    '<script type="module" src="components/stories-grid-refactored.js"></script>',
    '<script type="module" src="components/quiz-component-refactored.js"></script>'
  ],
  APP_INIT_SCRIPTS: [
    '<script type="module" src="js/app.js"></script>'
  ]
};

/**
 * Update the HTML file with the correct script imports
 */
async function updateHtmlFile() {
  try {
    const content = await readFile(config.INDEX_HTML, 'utf8');
    
    // Extract the sections of the HTML file
    const headEndIndex = content.indexOf('</head>');
    const scriptStartIndex = content.lastIndexOf('<script', headEndIndex);
    
    // Split the HTML into parts
    const headStart = content.substring(0, scriptStartIndex);
    const bodyPart = content.substring(headEndIndex);
    
    // Create the new script imports section
    const scriptImports = [
      ...config.CDN_IMPORTS,
      ...config.UTILITY_SCRIPTS,
      ...config.COMPONENT_SCRIPTS,
      `<script type="module" src="${config.COMPONENT_LOADER}"></script>`,
      ...config.APP_INIT_SCRIPTS
    ].join('\n    ');
    
    // Create the updated HTML
    const updatedHtml = `${headStart}
    <!-- Dynamically updated script imports -->
    ${scriptImports}
${bodyPart}`;
    
    // Write the updated HTML back to the file
    await writeFile(config.INDEX_HTML, updatedHtml, 'utf8');
    console.log(`✅ Updated script imports in ${config.INDEX_HTML}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error updating HTML file:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Updating HTML dependencies for proper loading order...');
  
  const updated = await updateHtmlFile();
  
  if (updated) {
    console.log('✨ Done! HTML dependencies updated successfully.');
  } else {
    console.error('❌ Failed to update HTML dependencies.');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 