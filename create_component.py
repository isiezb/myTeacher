#!/usr/bin/env python3
"""
Component Generator - Creates new component files with proper boilerplate

This script creates new web component files with appropriate boilerplate code
based on the templates defined in .cursor.json configuration.
"""

import os
import json
import re
import argparse
from typing import Dict, Optional

DEFAULT_TEMPLATE = """import { LitElement, html, css } from 'lit';

class {ClassName} extends LitElement {
  static properties = {
    // Define properties here
  };

  static styles = css`
    /* Component styles */
  `;

  constructor() {
    super();
    // Initialize properties
  }

  render() {
    return html`
      <!-- Component template -->
    `;
  }
}

customElements.define('{tag-name}', {ClassName});
"""

def load_cursor_config(config_path: str = ".cursor.json") -> Dict:
    """Load the cursor configuration file"""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Warning: Could not load {config_path}, using default templates")
        return {}

def kebab_to_pascal(kebab_name: str) -> str:
    """Convert kebab-case to PascalCase (e.g., 'my-component' -> 'MyComponent')"""
    return ''.join(word.capitalize() for word in kebab_name.split('-'))

def get_template(config: Dict, template_name: str) -> str:
    """Get the template content based on template name"""
    component_structure = config.get("componentStructure", {})
    templates = component_structure.get("templates", {})
    
    if template_name in templates:
        return templates[template_name].get("template", DEFAULT_TEMPLATE)
    
    return DEFAULT_TEMPLATE

def create_component_file(
    component_name: str, 
    output_dir: str, 
    config: Dict, 
    template_name: str = "lit-component",
    force: bool = False
) -> bool:
    """
    Create a component file with proper boilerplate
    
    Returns True if file was created, False otherwise
    """
    # Ensure component name is kebab-case
    if not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', component_name):
        print(f"Error: Component name '{component_name}' is not valid kebab-case")
        print("Please use lowercase letters, numbers, and hyphens (e.g., 'my-component')")
        return False
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Determine file path
    component_structure = config.get("componentStructure", {})
    name_pattern = component_structure.get("namePattern", "${name}.js")
    file_name = name_pattern.replace("${name}", component_name)
    file_path = os.path.join(output_dir, file_name)
    
    # Check if file already exists
    if os.path.exists(file_path) and not force:
        print(f"Error: File '{file_path}' already exists")
        print("Use --force to overwrite")
        return False
    
    # Get template
    template = get_template(config, template_name)
    
    # Fill in template placeholders
    class_name = kebab_to_pascal(component_name)
    content = template.replace("${Name}", class_name)
    content = content.replace("${name}", component_name)
    content = content.replace("${tag-name}", component_name)
    
    # Write the file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Created component file: {file_path}")
    return True

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Create a new web component file')
    parser.add_argument('name', help='Component name in kebab-case (e.g., my-component)')
    parser.add_argument('-d', '--directory', default='public/components', 
                        help='Output directory (default: public/components)')
    parser.add_argument('-t', '--template', default='lit-component',
                        help='Template name (default: lit-component)')
    parser.add_argument('-f', '--force', action='store_true',
                        help='Overwrite existing files')
    args = parser.parse_args()
    
    # Load config
    config = load_cursor_config()
    
    # Create component file
    create_component_file(
        args.name, 
        args.directory, 
        config, 
        args.template, 
        args.force
    )
    
if __name__ == "__main__":
    main() 