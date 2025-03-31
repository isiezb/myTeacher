#!/usr/bin/env node

/**
 * Fix Duplicate Registrations
 * 
 * This script prevents duplicate component registrations by adding
 * a guard check before calling customElements.define()
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
  // Pattern to find customElements.define calls
  DEFINE_PATTERN: /customElements\.define\(['"]([^'"]+)['"]/g,
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components'
  ],
  EXTENSIONS: ['.js']
};

/**
 * Process a single file to add registration guards
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const defineMatches = Array.from(content.matchAll(config.DEFINE_PATTERN));
    
    if (!defineMatches.length) return false;
    
    let updatedContent = content;
    let hasChanges = false;
    
    for (const match of defineMatches) {
      const fullMatch = match[0];
      const tagName = match[1];
      
      // Replace the direct define call with a guarded version
      const guardedDefine = `
// Guard against duplicate registration
if (!customElements.get('${tagName}')) {
  ${fullMatch}`;
      
      // Find the end of the define call to add closing brace
      const matchIndex = match.index;
      const defineCall = content.substring(matchIndex);
      const closeParenIndex = defineCall.indexOf(');') + 2;
      
      if (closeParenIndex > 1) {
        const beforeDefine = updatedContent.substring(0, matchIndex);
        const afterParenClose = updatedContent.substring(matchIndex + closeParenIndex);
        
        updatedContent = beforeDefine + guardedDefine + afterParenClose.replace(/^/, '\n}');
        hasChanges = true;
      }
    }
    
    // Write the updated content back to the file if changes were made
    if (hasChanges) {
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Added registration guards in: ${filePath}`);
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
  console.log('🔍 Scanning for component registrations to guard...');
  
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
  
  console.log(`\n✨ Done! Added registration guards to ${totalUpdated} files.`);
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 