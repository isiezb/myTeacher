#!/usr/bin/env python3
import os
import sys

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
    
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("ERROR: The following required environment variables are missing:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nPlease set these variables in your deployment environment.")
        return False
    else:
        print("All required environment variables are set.")
        return True

if __name__ == "__main__":
    print("Checking environment variables...")
    if not check_required_env_vars():
        sys.exit(1)  # Exit with error code
    print("Environment check passed.")
    sys.exit(0)  # Exit successfully 