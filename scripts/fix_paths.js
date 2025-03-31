#!/usr/bin/env node

/**
 * Fix Paths
 * 
 * This script ensures all component imports use absolute paths 
 * from the root to avoid path resolution issues
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
  IMPORT_PATTERN: /import\s+['"]\.\/(.+?)\.js['"]/g,
  PARENT_IMPORT_PATTERN: /import\s+['"]\.\.\/(.+?)\.js['"]/g,
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components'
  ],
  EXTENSIONS: ['.js']
};

/**
 * Process a single file to fix imports
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Get directory info for proper relative path transformation
    const dirName = path.dirname(filePath);
    const relativeToPublic = path.relative('public', dirName);
    
    // Fix same-directory imports
    const localImportMatches = content.match(config.IMPORT_PATTERN);
    if (localImportMatches) {
      for (const match of localImportMatches) {
        const importPath = match.match(/import\s+['"]\.\/(.+?)\.js['"]/)[1];
        const newImport = `import '/components/${path.basename(dirName)}/${importPath}.js'`;
        updatedContent = updatedContent.replace(match, newImport);
        hasChanges = true;
      }
    }
    
    // Fix parent directory imports
    const parentImportMatches = content.match(config.PARENT_IMPORT_PATTERN);
    if (parentImportMatches) {
      for (const match of parentImportMatches) {
        const importPath = match.match(/import\s+['"]\.\.\/(.+?)\.js['"]/)[1];
        const newImport = `import '/components/${importPath}.js'`;
        updatedContent = updatedContent.replace(match, newImport);
        hasChanges = true;
      }
    }
    
    // Write the updated content back to the file if changes were made
    if (hasChanges) {
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
  console.log('🔍 Scanning for relative import paths to fix...');
  
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
  
  console.log(`\n✨ Done! Updated ${totalUpdated} files with absolute import paths.`);
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 