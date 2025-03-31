#!/usr/bin/env node

/**
 * Fix Component Paths
 * 
 * This script corrects problematic paths in component imports
 * to ensure they resolve correctly at runtime.
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
  // Pattern to find incorrect paths like /components/components/...
  INCORRECT_PATH_PATTERN: /import\s+['"]\/components\/components\//g,
  // Pattern to find incorrect paths from fix_paths.js script
  NESTED_PATH_PATTERN: /import\s+['"]\/components\/(\w+)\/(.+?)\.js['"]/g,
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components'
  ],
  EXTENSIONS: ['.js']
};

/**
 * Process a single file to fix import paths
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Fix duplicate /components/components/ paths
    if (config.INCORRECT_PATH_PATTERN.test(content)) {
      updatedContent = updatedContent.replace(
        config.INCORRECT_PATH_PATTERN, 
        'import \'/components/'
      );
      hasChanges = true;
    }
    
    // Fix nested paths to be correct
    const nestedMatches = Array.from(content.matchAll(config.NESTED_PATH_PATTERN));
    if (nestedMatches.length > 0) {
      for (const match of nestedMatches) {
        const [fullMatch, dirName, fileName] = match;
        
        // Don't change imports that are already pointing to the right directory
        if (filePath.includes(`/components/${dirName}/`) && !filePath.includes(`${fileName}.js`)) {
          // This is importing from the current directory, change to relative import
          const newImport = `import './${fileName}.js'`;
          updatedContent = updatedContent.replace(fullMatch, newImport);
          hasChanges = true;
        } else {
          // This is importing from another subdirectory
          const newImport = `import '/components/${dirName}/${fileName}.js'`;
          updatedContent = updatedContent.replace(fullMatch, newImport);
          hasChanges = true;
        }
      }
    }
    
    // Write the updated content back to the file if changes were made
    if (hasChanges) {
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Fixed paths in: ${filePath}`);
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
  console.log('🔍 Scanning for problematic component paths...');
  
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
  
  console.log(`\n✨ Done! Fixed paths in ${totalUpdated} files.`);
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 