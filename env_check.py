#!/usr/bin/env python3
import os
import sys
from pathlib import Path

# Try to load environment variables from .env file (auto fallback)
try:
    from dotenv import load_dotenv
    dotenv_path = Path(__file__).parent / "backend" / ".env"
    if dotenv_path.exists():
        print(f"Loading environment variables from {dotenv_path}")
        load_dotenv(dotenv_path=dotenv_path)
    else:
        print("No .env file found at", dotenv_path)
        # Try another common location
        dotenv_path = Path(__file__).parent / ".env"
        if dotenv_path.exists():
            print(f"Loading environment variables from {dotenv_path}")
            load_dotenv(dotenv_path=dotenv_path)
        else:
            print("No .env file found at", dotenv_path)
except ImportError:
    print("python-dotenv package not installed, skipping .env file loading")

def mask_sensitive_value(var_name, value):
    """Mask sensitive values for safe printing"""
    sensitive_vars = ["KEY", "PASSWORD", "SECRET", "TOKEN"]
    
    # Check if this variable should be masked
    should_mask = any(sensitive in var_name for sensitive in sensitive_vars)
    
    if should_mask and value and len(value) > 4:
        # Show just the first 4 characters followed by asterisks
        return value[:4] + "*" * (len(value) - 4)
    return value

def check_required_env_vars():
    """Check if all required environment variables are set"""
    
    required_vars = [
        # Backend settings
        "PORT",  # Usually set by Render but may need to be explicitly set in other environments
        
        # API settings
        "OPENROUTER_API_KEY",
        "OPENROUTER_MODEL",
        
        # Supabase settings
        "SUPABASE_URL",
        "SUPABASE_SERVICE_KEY"
    ]
    
    missing_vars = []
    found_vars = []
    
    for var in required_vars:
        value = os.environ.get(var)
        if not value:
            missing_vars.append(var)
        else:
            found_vars.append((var, mask_sensitive_value(var, value)))
    
    # Print what we found
    if found_vars:
        print("\nFound the following environment variables:")
        for var, masked_value in found_vars:
            print(f"  - {var}: {masked_value}")
    
    # Print what's missing
    if missing_vars:
        print("\nERROR: The following required environment variables are missing:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease set these variables in your deployment environment.")
        return False
    else:
        print("\nAll required environment variables are set.")
        return True

def check_python_path():
    """Print Python path information for debugging"""
    print("\nPython path information:")
    print(f"  - sys.path: {sys.path}")
    print(f"  - PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")
    print(f"  - Current working directory: {os.getcwd()}")
    return True

if __name__ == "__main__":
    print("====== Environment Diagnostics ======")
    check_python_path()
    print("\nChecking environment variables...")
    if not check_required_env_vars():
        sys.exit(1)  # Exit with error code
    print("\nEnvironment check passed.")
    sys.exit(0)  # Exit successfully 