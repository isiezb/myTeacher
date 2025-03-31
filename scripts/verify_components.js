#!/usr/bin/env node

/**
 * Verify Components
 * 
 * This script verifies that all custom elements are properly defined and registered 
 * by looking for customElements.define calls in component files.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Configuration
const config = {
  DEFINE_PATTERN: /customElements\.define\(['"]([^'"]+)['"]/g,
  CLASS_PATTERN: /class\s+(\w+)\s+extends\s+(\w+)/g,
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components'
  ],
  EXTENSIONS: ['.js']
};

// Store found custom elements
const foundElements = new Map();
const definedElements = new Set();
const classes = new Map();

/**
 * Process a single file to find custom element definitions
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const filename = path.basename(filePath);
    
    // Find custom element definitions
    let match;
    config.DEFINE_PATTERN.lastIndex = 0;
    while ((match = config.DEFINE_PATTERN.exec(content)) !== null) {
      const tagName = match[1];
      definedElements.add(tagName);
      foundElements.set(tagName, filePath);
    }
    
    // Find class definitions
    config.CLASS_PATTERN.lastIndex = 0;
    while ((match = config.CLASS_PATTERN.exec(content)) !== null) {
      const className = match[1];
      const parentClass = match[2];
      classes.set(className, {
        file: filePath,
        parent: parentClass
      });
    }
    
    return true;
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
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.isFile() && config.EXTENSIONS.includes(path.extname(entry.name))) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning for custom element definitions...');
  
  for (const dir of config.DIRECTORIES) {
    const dirStat = await stat(dir).catch(() => null);
    
    if (dirStat && dirStat.isDirectory()) {
      await scanDirectory(dir);
    } else {
      console.warn(`⚠️ Directory not found: ${dir}`);
    }
  }
  
  console.log(`\n📊 Found ${definedElements.size} defined custom elements:`);
  
  // Find potential issues
  const litElementClasses = Array.from(classes.entries())
    .filter(([_, data]) => data.parent === 'LitElement')
    .map(([name, data]) => ({
      name,
      file: data.file
    }));
  
  // Check for classes that extend LitElement but might not be defined
  const undefinedComponents = litElementClasses.filter(c => {
    // Check if class name in kebab case might be registered
    const kebabCase = c.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return ![...definedElements].some(element => 
      element === kebabCase || 
      element === c.name.toLowerCase() ||
      element === `${c.name.toLowerCase()}-element`
    );
  });
  
  // Print defined elements
  if (definedElements.size > 0) {
    console.log('\n✅ Defined Custom Elements:');
    Array.from(definedElements).sort().forEach(element => {
      console.log(`  - <${element}> (defined in ${path.basename(foundElements.get(element))})`);
    });
  }
  
  // Print potential issues
  if (undefinedComponents.length > 0) {
    console.log('\n⚠️ Potential Unregistered Components:');
    undefinedComponents.forEach(c => {
      console.log(`  - ${c.name} in ${path.basename(c.file)} might not be registered with customElements.define()`);
    });
  }
  
  if (undefinedComponents.length === 0) {
    console.log('\n✨ All components appear to be properly registered!');
  } else {
    console.log('\n⚠️ Some components might not be properly registered. Please check the files listed above.');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 