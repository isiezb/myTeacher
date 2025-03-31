#!/usr/bin/env node

/**
 * Fix Component Registrations
 * 
 * This script ensures all LitElement components have proper customElements.define
 * registrations to avoid unregistered component issues.
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
  CLASS_PATTERN: /class\s+(\w+)\s+extends\s+LitElement/g,
  REGISTER_PATTERN: /customElements\.define\(['"]([^'"]+)['"]/g,
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components'
  ],
  EXTENSIONS: ['.js'],
  // Map of class names to element names (for automatic registration)
  NAME_MAPPING: {
    // Examples - will be auto-generated for new components
    // StoryContent: 'story-content',
    // StoryForm: 'story-form'
  }
};

// Use a kebab-case converter for automatic tag name generation
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Process a single file to check and fix component registration
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Find class declarations
    const classMatches = Array.from(content.matchAll(config.CLASS_PATTERN));
    if (!classMatches.length) return false;
    
    // Find registrations
    const registerMatches = Array.from(content.matchAll(config.REGISTER_PATTERN));
    
    // Extract class names and registered element names
    const classNames = classMatches.map(match => match[1]);
    const registeredElements = registerMatches.map(match => match[1]);
    const registeredClasses = registerMatches.map(match => {
      // Try to extract the class from customElements.define('tag-name', ClassName)
      const defineCall = match.input.substring(match.index);
      const classMatch = defineCall.match(/\(['"][^'"]+['"],\s*(\w+)/);
      return classMatch ? classMatch[1] : null;
    }).filter(Boolean);
    
    // Check if any classes are not registered
    const unregisteredClasses = classNames.filter(className => 
      !registeredClasses.includes(className)
    );
    
    if (!unregisteredClasses.length) return false;
    
    // Fix registrations
    let updatedContent = content;
    let hasChanges = false;
    
    for (const className of unregisteredClasses) {
      // Generate tag name from class name if not in mapping
      const tagName = config.NAME_MAPPING[className] || toKebabCase(className);
      
      // Only add if this tag name isn't already registered
      if (!registeredElements.includes(tagName)) {
        const registrationCode = `\n// Auto-registered by fix_registrations.js\ncustomElements.define('${tagName}', ${className});\n`;
        
        // Check if there's an export statement to place after
        if (updatedContent.includes(`export class ${className}`)) {
          updatedContent = updatedContent.replace(
            new RegExp(`export class ${className}([^{]*){([\\s\\S]*?)}\\s*$`, 'm'),
            (match) => `${match}\n${registrationCode}`
          );
        } else {
          // Otherwise append to the end of the file
          updatedContent += registrationCode;
        }
        
        hasChanges = true;
      }
    }
    
    // Write the updated content back to the file if changes were made
    if (hasChanges) {
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ Added registrations in: ${filePath}`);
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
  console.log('🔍 Scanning for components missing proper registration...');
  
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
  
  if (totalUpdated > 0) {
    console.log(`\n✨ Done! Added registrations to ${totalUpdated} components.`);
  } else {
    console.log(`\n✅ All components are properly registered!`);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 