#!/usr/bin/env node

/**
 * Component Audit Tool
 * 
 * This script performs a comprehensive audit of the component structure
 * to identify potential issues with imports, dependencies, and registrations.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Configuration
const config = {
  IMPORT_PATTERN: /import\s+(?:.*from\s+)?['"]([^'"]+)(?:\.js)?['"]/g,
  CLASS_PATTERN: /class\s+(\w+)\s+extends\s+(LitElement|HTMLElement)/g,
  REGISTER_PATTERN: /customElements\.define\(['"]([^'"]+)['"]/g,
  DIRECTORIES: [
    'public/components/form',
    'public/components/story',
    'public/components/continuation',
    'public/components',
    'public/js'
  ],
  EXTENSIONS: ['.js'],
  HTML_FILES: ['public/index.html']
};

// Store component information
const components = {
  defined: new Map(), // tagName -> className, fileName
  classes: new Map(),  // className -> fileName, extends
  imports: new Map(),  // fileName -> [importedFiles]
  htmlImports: new Set() // scripts imported in HTML
};

// Process HTML file to find script imports
async function processHtmlFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Find script tags with src attributes
    const scriptRegex = /<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/g;
    let match;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      const scriptSrc = match[1];
      components.htmlImports.add(scriptSrc);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing HTML file ${filePath}:`, error.message);
    return false;
  }
}

// Process a single JS file to extract component info
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Find imports
    const importMatches = Array.from(content.matchAll(config.IMPORT_PATTERN));
    const importedFiles = importMatches.map(match => match[1]);
    components.imports.set(relativePath, importedFiles);
    
    // Find class declarations
    const classMatches = Array.from(content.matchAll(config.CLASS_PATTERN));
    classMatches.forEach(match => {
      const className = match[1];
      const extendsClass = match[2];
      components.classes.set(className, {
        fileName: relativePath,
        extends: extendsClass
      });
    });
    
    // Find registrations
    const registerMatches = Array.from(content.matchAll(config.REGISTER_PATTERN));
    registerMatches.forEach(match => {
      const tagName = match[1];
      // Try to extract the class name
      const defineCall = match.input.substring(match.index);
      const classMatch = defineCall.match(/\(['"][^'"]+['"],\s*(\w+)/);
      const className = classMatch ? classMatch[1] : 'Unknown';
      
      components.defined.set(tagName, {
        className,
        fileName: relativePath
      });
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// Recursively scan a directory for JS files
async function scanDirectory(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    let count = 0;
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        count += await scanDirectory(fullPath);
      } else if (entry.isFile() && config.EXTENSIONS.includes(path.extname(entry.name))) {
        const processed = await processFile(fullPath);
        if (processed) count++;
      }
    }
    
    return count;
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
    return 0;
  }
}

// Analyze collected data for potential issues
function analyzeComponents() {
  const issues = [];
  
  // Check for classes without registration
  for (const [className, info] of components.classes) {
    if (info.extends === 'LitElement') {
      let isRegistered = false;
      
      for (const [, defInfo] of components.defined) {
        if (defInfo.className === className) {
          isRegistered = true;
          break;
        }
      }
      
      if (!isRegistered) {
        issues.push({
          type: 'UNREGISTERED_COMPONENT',
          message: `Class ${className} in ${info.fileName} extends LitElement but is not registered with customElements.define()`
        });
      }
    }
  }
  
  // Check for imported files that might not exist or have wrong paths
  for (const [fileName, imports] of components.imports) {
    imports.forEach(importPath => {
      // Skip absolute URLs and node modules
      if (importPath.startsWith('http') || !importPath.startsWith('.')) {
        return;
      }
      
      // Normalize the import path
      let resolvedPath = importPath;
      if (!importPath.endsWith('.js')) {
        resolvedPath += '.js';
      }
      
      // Convert import path to file path relative to the importing file
      const importingDir = path.dirname(fileName);
      const targetPath = path.normalize(path.join(importingDir, resolvedPath));
      
      // Check if any known component file matches this path
      const matchesKnownFile = Array.from(components.imports.keys()).some(
        file => path.normalize(file) === targetPath
      );
      
      if (!matchesKnownFile) {
        issues.push({
          type: 'POTENTIALLY_MISSING_IMPORT',
          message: `File ${fileName} imports ${importPath} which could not be found at ${targetPath}`
        });
      }
    });
  }
  
  // Check for components used in index.html but not registered
  const htmlImportedComponents = new Set();
  for (const scriptSrc of components.htmlImports) {
    // Extract component name from script src
    const match = scriptSrc.match(/.*\/([^/]+)(-refactored)?\.js$/);
    if (match) {
      const componentName = match[1];
      htmlImportedComponents.add(componentName);
    }
  }
  
  return issues;
}

// Main function
async function main() {
  console.log('🔍 Starting component audit...');
  
  let filesProcessed = 0;
  
  // Process HTML files first
  for (const htmlFile of config.HTML_FILES) {
    const processed = await processHtmlFile(htmlFile);
    if (processed) console.log(`✅ Processed HTML file: ${htmlFile}`);
  }
  
  // Process JS files
  for (const dir of config.DIRECTORIES) {
    const dirStat = await stat(dir).catch(() => null);
    
    if (dirStat && dirStat.isDirectory()) {
      const processed = await scanDirectory(dir);
      filesProcessed += processed;
      console.log(`📁 Processed directory ${dir}: ${processed} files`);
    } else {
      console.warn(`⚠️ Directory not found: ${dir}`);
    }
  }
  
  console.log(`\n📊 Audit Summary:`);
  console.log(`- Processed ${filesProcessed} JavaScript files`);
  console.log(`- Found ${components.classes.size} component classes`);
  console.log(`- Found ${components.defined.size} registered custom elements`);
  console.log(`- Found ${components.htmlImports.size} script imports in HTML`);
  
  // Analyze findings
  const issues = analyzeComponents();
  
  if (issues.length > 0) {
    console.log(`\n⚠️ Found ${issues.length} potential issues:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
    });
  } else {
    console.log(`\n✅ No issues found in component structure!`);
  }
  
  // Print component dependency tree for refactored components
  console.log('\n📋 Component Dependency Tree:');
  for (const [tagName, info] of components.defined) {
    if (tagName.includes('-refactored') || info.fileName.includes('-refactored')) {
      console.log(`- ${tagName} (${info.className}) defined in ${info.fileName}`);
      
      // Find imports for this file
      const imports = components.imports.get(info.fileName) || [];
      imports.forEach(imp => {
        console.log(`  └─ imports ${imp}`);
      });
    }
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error executing script:', error);
  process.exit(1);
}); 