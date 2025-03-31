#!/usr/bin/env node

/**
 * Find Large Files
 * 
 * This script scans the project for files that exceed the specified line count threshold,
 * helping identify targets for refactoring.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Configuration
const config = {
  MAX_LINES: 350,
  IGNORE_DIRS: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'venv',
    'env',
    '__pycache__'
  ],
  EXTENSIONS: [
    '.js',
    '.py',
    '.jsx',
    '.ts',
    '.tsx',
    '.css',
    '.scss',
    '.html'
  ]
};

/**
 * Check if a file should be processed based on extension
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.EXTENSIONS.includes(ext);
}

/**
 * Check if a directory should be ignored
 */
function shouldIgnoreDir(dirPath) {
  const basename = path.basename(dirPath);
  return config.IGNORE_DIRS.includes(basename);
}

/**
 * Count the number of lines in a file
 */
async function countLines(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return 0;
  }
}

/**
 * Recursively scan directories for large files
 */
async function scanDirectory(dirPath, results = []) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldIgnoreDir(fullPath)) {
          await scanDirectory(fullPath, results);
        }
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        const lineCount = await countLines(fullPath);
        
        if (lineCount > config.MAX_LINES) {
          results.push({
            path: fullPath,
            lines: lineCount,
            exceeds: lineCount - config.MAX_LINES
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}: ${error.message}`);
    return results;
  }
}

/**
 * Format results as a table
 */
function formatResults(results) {
  if (results.length === 0) {
    return 'No files exceed the maximum line count. Great job!';
  }
  
  // Sort by line count (descending)
  results.sort((a, b) => b.lines - a.lines);
  
  // Calculate column widths
  const pathWidth = Math.max(...results.map(r => r.path.length), 'File Path'.length);
  const linesWidth = Math.max(...results.map(r => String(r.lines).length), 'Lines'.length);
  const exceedsWidth = Math.max(...results.map(r => String(r.exceeds).length), 'Exceeds By'.length);
  
  // Create header
  let table = [
    '┌' + '─'.repeat(pathWidth + 2) + '┬' + '─'.repeat(linesWidth + 2) + '┬' + '─'.repeat(exceedsWidth + 2) + '┐',
    '│ ' + 'File Path'.padEnd(pathWidth) + ' │ ' + 'Lines'.padEnd(linesWidth) + ' │ ' + 'Exceeds By'.padEnd(exceedsWidth) + ' │',
    '├' + '─'.repeat(pathWidth + 2) + '┼' + '─'.repeat(linesWidth + 2) + '┼' + '─'.repeat(exceedsWidth + 2) + '┤'
  ];
  
  // Add rows
  for (const result of results) {
    table.push(
      '│ ' + result.path.padEnd(pathWidth) + ' │ ' + 
      String(result.lines).padEnd(linesWidth) + ' │ ' + 
      String(result.exceeds).padEnd(exceedsWidth) + ' │'
    );
  }
  
  // Add footer
  table.push('└' + '─'.repeat(pathWidth + 2) + '┴' + '─'.repeat(linesWidth + 2) + '┴' + '─'.repeat(exceedsWidth + 2) + '┘');
  
  return table.join('\n');
}

/**
 * Main function
 */
async function main() {
  const startDir = process.argv[2] || '.';
  
  console.log(`Scanning for files with more than ${config.MAX_LINES} lines...`);
  
  const results = await scanDirectory(startDir);
  console.log(`\nFound ${results.length} files exceeding the maximum line count:\n`);
  console.log(formatResults(results));
  
  if (results.length > 0) {
    console.log('\nRefactoring recommendations:');
    console.log('1. Break down large files into smaller, focused modules');
    console.log('2. Extract utility functions to separate files');
    console.log('3. Split UI components into smaller sub-components');
    console.log('4. Create shared libraries for common functionality');
  }
}

// Run the script
main().catch(error => {
  console.error('Error executing script:', error);
  process.exit(1);
}); 