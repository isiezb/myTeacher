#!/usr/bin/env node

/**
 * Fix Lit Imports
 * 
 * This script replaces all direct 'lit' imports with CDN imports
 * in refactored components.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Configuration
const config = {
  IMPORT_PATTERN: /import\s*{\s*(?:LitElement|html|css)(?:,\s*(?:LitElement|html|css))*\s*}\s*from\s*['"]lit['"]/g,
  REPLACEMENT: "import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js'",
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components'
  ],
  EXTENSIONS: ['.js']
};

/**
 * Process a single file to replace imports
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if file contains the import pattern
    if (config.IMPORT_PATTERN.test(content)) {
      // Reset the regex lastIndex
      config.IMPORT_PATTERN.lastIndex = 0;
      
      // Replace the import
      const updatedContent = content.replace(config.IMPORT_PATTERN, config.REPLACEMENT);
      
      // Write the updated content back to the file
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively scan a directory for JS files
 */
async function scanDirectory(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    let count = 0;
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        count += await scanDirectory(fullPath);
      } else if (entry.isFile() && config.EXTENSIONS.includes(path.extname(entry.name))) {
        const updated = await processFile(fullPath);
        if (updated) count++;
      }
    }
    
    return count;
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning directories for Lit imports to fix...');
  
  let totalUpdated = 0;
  
  for (const dir of config.DIRECTORIES) {
    const dirStat = await stat(dir).catch(() => null);
    
    if (dirStat && dirStat.isDirectory()) {
      const updated = await scanDirectory(dir);
      totalUpdated += updated;
      console.log(`📁 Processed directory ${dir}: ${updated} files updated`);
    } else {
      console.warn(`⚠️ Directory not found: ${dir}`);
    }
  }
  
  console.log(`\n✨ Done! Updated ${totalUpdated} files with proper Lit imports.`);
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 