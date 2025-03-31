#!/usr/bin/env python3
"""
Line Counter - Identify files exceeding line limits defined in Cursor configuration.

This script scans the project directory and identifies files that exceed
the line limits defined in the .cursor.json configuration.
"""

import os
import json
import re
from collections import defaultdict
import argparse
from typing import Dict, List, Tuple, Optional

# Default limits from .cursor.json
DEFAULT_MAX_LINES = 350
DIRECTORY_SPECIFIC_LIMITS = {
    "models": 200,
    "routers": 200,
    "public/js": 350,
    "public/css": 250,
    "public/components": 350,
    "services": 350
}

def load_cursor_config(config_path: str = ".cursor.json") -> Dict:
    """Load the cursor configuration file"""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Warning: Could not load {config_path}, using default limits")
        return {}

def get_limit_for_file(file_path: str, config: Dict) -> int:
    """Determine the line limit for a specific file based on its path"""
    # Default limit
    limit = config.get("maxLinesPerFile", DEFAULT_MAX_LINES)
    
    # Check directory-specific limits from config
    file_struct = config.get("fileStructure", {})
    for dir_path, dir_config in file_struct.items():
        if dir_path in file_path:
            dir_limit = dir_config.get("maxLinesPerFile")
            if dir_limit:
                limit = dir_limit
                
            # Check for nested directory configs (like public/components)
            for subdir, subdir_config in dir_config.items():
                if isinstance(subdir_config, dict) and subdir in file_path:
                    subdir_limit = subdir_config.get("maxLinesPerFile")
                    if subdir_limit:
                        limit = subdir_limit
    
    return limit

def count_lines(file_path: str) -> int:
    """Count the number of lines in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return sum(1 for _ in f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

def scan_directory(
    directory: str, 
    config: Dict, 
    file_pattern: Optional[str] = None
) -> List[Tuple[str, int, int]]:
    """
    Scan directory for files exceeding line limits
    
    Returns a list of tuples (file_path, line_count, limit)
    """
    results = []
    pattern = re.compile(file_pattern) if file_pattern else None
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.startswith('.') or file == 'node_modules':
                continue
                
            file_path = os.path.join(root, file)
            
            # Skip if pattern doesn't match
            if pattern and not pattern.search(file_path):
                continue
                
            # Get appropriate limit
            limit = get_limit_for_file(file_path, config)
            
            # Count lines
            line_count = count_lines(file_path)
            
            # Check if exceeds limit
            if line_count > limit:
                rel_path = os.path.relpath(file_path)
                results.append((rel_path, line_count, limit))
    
    return results

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Find files exceeding line limits')
    parser.add_argument('-d', '--directory', default='.', 
                        help='Root directory to scan (default: current directory)')
    parser.add_argument('-p', '--pattern', 
                        help='Regex pattern to filter files')
    parser.add_argument('-s', '--sort', choices=['path', 'lines', 'percent'],
                        default='percent', help='Sort results by')
    args = parser.parse_args()
    
    # Load config
    config = load_cursor_config()
    
    # Scan directory
    results = scan_directory(args.directory, config, args.pattern)
    
    # Sort results
    if args.sort == 'path':
        results.sort(key=lambda x: x[0])
    elif args.sort == 'lines':
        results.sort(key=lambda x: x[1], reverse=True)
    else:  # percent
        results.sort(key=lambda x: x[1]/x[2], reverse=True)
    
    # Group results by directory for better organization
    by_directory = defaultdict(list)
    for path, lines, limit in results:
        directory = os.path.dirname(path) or "."
        by_directory[directory].append((path, lines, limit))
    
    # Print results
    if not results:
        print("No files exceeding configured line limits were found.")
        return
        
    print(f"\n{'=' * 80}")
    print(f"Files exceeding configured line limits:")
    print(f"{'=' * 80}")
    
    for directory, files in by_directory.items():
        print(f"\n[{directory}]")
        print(f"{'-' * 80}")
        print(f"{'FILE':<50} {'LINES':<8} {'LIMIT':<8} {'OVER BY':<8} {'%':<6}")
        print(f"{'-' * 80}")
        
        for path, lines, limit in files:
            filename = os.path.basename(path)
            over_by = lines - limit
            percent = (lines / limit) * 100
            print(f"{filename:<50} {lines:<8} {limit:<8} {over_by:<8} {percent:.1f}%")
    
    print("\nTotal files exceeding limits:", len(results))
    
if __name__ == "__main__":
    main() 