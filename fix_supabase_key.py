#!/usr/bin/env python3
"""
Supabase Key Fixer
This script helps diagnose and fix Supabase key issues in your deployment
"""

import sys
import os
from pathlib import Path

def print_info(msg):
    print(f"\033[94m[INFO]\033[0m {msg}")

def print_warning(msg):
    print(f"\033[93m[WARNING]\033[0m {msg}")
    
def print_error(msg):
    print(f"\033[91m[ERROR]\033[0m {msg}")
    
def print_success(msg):
    print(f"\033[92m[SUCCESS]\033[0m {msg}")

def check_key_format(key):
    """Check if the key has the right format for a Supabase service_role key"""
    if not key:
        return False, "Key is empty"
        
    if not key.startswith('eyJ'):
        return False, "Supabase keys should start with 'eyJ'"
        
    if key.count('.') != 2:
        return False, f"Key should have 2 dots (.) but has {key.count('.')}"
        
    return True, "Key format looks correct"

def main():
    print_info("Supabase API Key Troubleshooter")
    print_info("==============================")
    
    print_info("\n1. Checking current environment variables...")
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not supabase_url:
        print_error("SUPABASE_URL is not set in your environment")
        print_info("Your Supabase URL should look like: https://xxx.supabase.co")
    else:
        print_success(f"SUPABASE_URL is set to: {supabase_url}")
    
    if not supabase_key:
        print_error("SUPABASE_SERVICE_KEY is not set in your environment")
    else:
        masked_key = supabase_key[:4] + "*" * (len(supabase_key) - 8) + supabase_key[-4:] if len(supabase_key) > 8 else "****"
        print_success(f"SUPABASE_SERVICE_KEY is set to: {masked_key} (length: {len(supabase_key)})")
        
        # Check format
        valid, reason = check_key_format(supabase_key)
        if valid:
            print_success(f"Key format check: {reason}")
        else:
            print_error(f"Key format check: {reason}")
            
    # Print key guidelines
    print_info("\n2. Supabase key guidelines:")
    print_info("- The service_role key is different from the anon key")
    print_info("- It should start with 'eyJ' and contain two dots (.)")
    print_info("- It should be about 160-200 characters long")
    print_info("- You can find it in your Supabase dashboard under:")
    print_info("  Project Settings → API → Project API Keys → service_role secret")
    
    # Deployment instructions
    print_info("\n3. How to set the key in different environments:")
    print_info("a) In Render.com or similar platforms:")
    print_info("   - Navigate to your service → Environment")
    print_info("   - Add/update SUPABASE_SERVICE_KEY with the exact value")
    print_info("   - Be careful not to include any whitespace or quotes")
    
    print_info("\nb) For local development:")
    print_info("   - Create/edit backend/.env file")
    print_info("   - Set SUPABASE_SERVICE_KEY='your-key-here'")
    print_info("   - Do not commit this file to version control")
    
    # Common troubleshooting
    print_info("\n4. Common issues:")
    print_info("- Extra whitespace or quotes in the key")
    print_info("- Using the anon key instead of service_role key")
    print_info("- Using a key from a different Supabase project")
    print_info("- Key was regenerated in the Supabase dashboard")
    
    print_info("\n5. Next steps:")
    print_info("- Verify your key in the Supabase dashboard")
    print_info("- Check your environment variable is exactly the same")
    print_info("- Try regenerating the key if necessary")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 