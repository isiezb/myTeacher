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
  DEBUG_SCRIPT: '<script type="module" src="js/component-debug.js"></script>',
  REGISTRATION_FIX_SCRIPT: '<script type="module" src="js/register-fix.js"></script>',
  COMPONENT_LOADER: 'js/component-loader.js',
  APP_INIT: 'js/app.js',
  
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
    // Sub-components (must be loaded before main components)
    '<script type="module" src="components/form/form-settings-card.js"></script>',
    '<script type="module" src="components/form/form-input-group.js"></script>',
    '<script type="module" src="components/form/form-grid.js"></script>',
    '<script type="module" src="components/form/form-checkbox-options.js"></script>',
    '<script type="module" src="components/form/submit-button.js"></script>',
    '<script type="module" src="components/story/story-header.js"></script>',
    '<script type="module" src="components/story/story-text.js"></script>',
    '<script type="module" src="components/story/story-summary.js"></script>',
    '<script type="module" src="components/story/story-vocabulary.js"></script>',
    '<script type="module" src="components/story/story-quiz.js"></script>',
    '<script type="module" src="components/continuation/difficulty-selector.js"></script>',
    '<script type="module" src="components/continuation/difficulty-description.js"></script>',
    '<script type="module" src="components/continuation/vocabulary-display.js"></script>',
    '<script type="module" src="components/continuation/continuation-form.js"></script>',
    '<script type="module" src="components/continuation/continuation-result.js"></script>',
    '<script type="module" src="components/continuation/error-message.js"></script>',
    '<script type="module" src="components/grid/grid-loading.js"></script>',
    '<script type="module" src="components/grid/grid-error.js"></script>',
    '<script type="module" src="components/grid/grid-empty-state.js"></script>',
    '<script type="module" src="components/grid/story-item.js"></script>',
    '<script type="module" src="components/grid/refresh-button.js"></script>',
    '<script type="module" src="components/quiz/quiz-option.js"></script>',
    '<script type="module" src="components/quiz/quiz-question.js"></script>',
    '<script type="module" src="components/quiz/quiz-results.js"></script>',
    '<script type="module" src="components/display/display-content.js"></script>',
    '<script type="module" src="components/display/display-empty.js"></script>',
    '<script type="module" src="components/display/display-error.js"></script>',
    '<script type="module" src="components/display/display-controls.js"></script>',
    '<script type="module" src="components/card/card-header.js"></script>',
    '<script type="module" src="components/card/card-content.js"></script>',
    '<script type="module" src="components/card/card-actions.js"></script>',
    
    // Main refactored components
    '<script type="module" src="components/story-form-refactored.js"></script>',
    '<script type="module" src="components/story-content-refactored.js"></script>',
    '<script type="module" src="components/story-continuation-refactored.js"></script>',
    '<script type="module" src="components/stories-grid-refactored.js"></script>',
    '<script type="module" src="components/quiz-component-refactored.js"></script>',
    '<script type="module" src="components/story-display-refactored.js"></script>',
    '<script type="module" src="components/story-card-refactored.js"></script>',
    
    // Original components (for fallback or non-refactored mode)
    '<script type="module" src="components/story-display.js"></script>',
    '<script type="module" src="components/story-card.js"></script>',
    '<script type="module" src="components/story-form.js"></script>',
    '<script type="module" src="components/story-content.js"></script>',
    '<script type="module" src="components/story-continuation.js"></script>',
    '<script type="module" src="components/stories-grid.js"></script>',
    '<script type="module" src="components/quiz-component.js"></script>',
    
    // Fixed version for debugging/fallback
    '<script type="module" src="components/story-display-fixed.js"></script>',
  ],
  
  // Non-module scripts (load at the end of body)
  NON_MODULE_SCRIPTS: [
    '<script src="js/debug.js"></script>',
    '<script src="js/env.js"></script>',
    '<script src="js/config.js"></script>',
    '<script src="js/supabase.js"></script>',
    '<script src="js/api-service.js"></script>',
    '<script src="js/proxy-service.js"></script>'
  ]
};

/**
 * Update the HTML file with the correct script imports
 */
async function updateHtmlFile() {
  try {
    let content = await readFile(config.INDEX_HTML, 'utf8');
    
    // Find the end of the head tag
    const headEndMarker = '</head>';
    const headEndIndex = content.indexOf(headEndMarker);
    if (headEndIndex === -1) {
      throw new Error('Could not find </head> tag in index.html');
    }
    
    // Find the start of existing script imports in head to replace them
    const headScriptStartMarker = '<!-- Debug script for component debugging -->';
    let headScriptStartIndex = content.indexOf(headScriptStartMarker);
    if (headScriptStartIndex === -1) {
       // If marker not found, find the first script tag before </head>
       headScriptStartIndex = content.lastIndexOf('<script', headEndIndex);
       if (headScriptStartIndex === -1) {
           // If no script found, insert before </head>
           headScriptStartIndex = headEndIndex;
       }
    }
    
    // Construct the new head script block
    const headScripts = [
      config.DEBUG_SCRIPT,
      '<!-- Dynamically updated script imports - Consolidated -->',
      ...config.CDN_IMPORTS,
      ...config.UTILITY_SCRIPTS,
      ...config.COMPONENT_SCRIPTS,
      `<script type="module" src="${config.COMPONENT_LOADER}"></script>`,
      `<script type="module" src="${config.APP_INIT}"></script>`,
      config.REGISTRATION_FIX_SCRIPT
    ].join('\n    ');
    
    // Insert the new head script block
    const headStart = content.substring(0, headScriptStartIndex);
    const headEnd = content.substring(headEndIndex);
    let updatedContent = `${headStart}
    ${headScripts}
${headEnd}`;

    // Find the end of the body tag
    const bodyEndMarker = '</body>';
    const bodyEndIndex = updatedContent.indexOf(bodyEndMarker);
    if (bodyEndIndex === -1) {
      throw new Error('Could not find </body> tag in index.html');
    }
    
    // Find the start of existing non-module scripts to replace them
    const nonModuleStartMarker = '<!-- Non-module JavaScript Files needed before app logic -->';
    let nonModuleStartIndex = updatedContent.indexOf(nonModuleStartMarker);
    if (nonModuleStartIndex === -1) {
      // If marker not found, find the first non-module script tag before </body>
      nonModuleStartIndex = updatedContent.lastIndexOf('<script src=', bodyEndIndex);
      if (nonModuleStartIndex === -1) {
          // If no script found, insert just before </body>
          nonModuleStartIndex = bodyEndIndex;
      }
    } else {
       // Adjust index to include the marker itself if found
       nonModuleStartIndex = updatedContent.lastIndexOf('\n', nonModuleStartIndex) + 1;
    }
    
    // Find the end of the non-module script section (before inline scripts)
    const inlineScriptStartMarker = '<!-- Inline scripts for basic UI functionality -->';
    let nonModuleEndIndex = updatedContent.indexOf(inlineScriptStartMarker, nonModuleStartIndex);
     if (nonModuleEndIndex === -1) {
        // If marker not found, assume it ends before the debug container
        const debugContainerMarker = '<!-- Debug container for story-display -->';
        nonModuleEndIndex = updatedContent.indexOf(debugContainerMarker, nonModuleStartIndex);
        if (nonModuleEndIndex === -1) {
           // If still not found, assume it ends just before </body>
           nonModuleEndIndex = bodyEndIndex;
        }
     }
     nonModuleEndIndex = updatedContent.lastIndexOf('\n', nonModuleEndIndex);

    // Construct the new non-module script block
    const nonModuleScripts = [
      nonModuleStartMarker,
      ...config.NON_MODULE_SCRIPTS
    ].join('\n  ');
    
    // Replace the old non-module script section
    const bodyStart = updatedContent.substring(0, nonModuleStartIndex);
    const bodyEnd = updatedContent.substring(nonModuleEndIndex);
    updatedContent = `${bodyStart}${nonModuleScripts}
  ${bodyEnd}`;
    
    // Write the updated HTML back to the file
    await writeFile(config.INDEX_HTML, updatedContent, 'utf8');
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