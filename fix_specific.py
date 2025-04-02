#!/usr/bin/env python3
import os
import re

# Fix 1: Prompt builder indentation issue
def fix_prompt_builder_indentation():
    print("Fixing prompt_builder.py indentation...")
    file_path = "backend/app/services/prompt_builder.py"
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return False
    
    with open(file_path, "r") as f:
        lines = f.readlines()

    # Define the problematic logger lines based on line number in error message
    target_line = 'logger.debug(f"Generated User Prompt (Continuation):\n{user_prompt[:500]}...")'
    logger_line_number = -1

    # Find the exact line
    for i, line in enumerate(lines):
        if target_line in line:
            logger_line_number = i
            break

    # If we found the line, fix it and the next two lines (the other logger line and the return statement)
    if logger_line_number > 0:
        # Ensure these lines have exactly 4 spaces of indentation
        for i in range(logger_line_number, logger_line_number + 3):
            if i < len(lines):
                # Remove all leading whitespace and add 4 spaces
                lines[i] = "    " + lines[i].lstrip()
        
        print(f"Fixed indentation for lines {logger_line_number + 1}-{logger_line_number + 3}")
        
        # Write back to the file
        with open(file_path, "w") as f:
            f.writelines(lines)
        return True
    else:
        print("Could not find the target logger line.")
        return False

# Fix 2: Handle Pydantic compatibility (model_dump vs dict)
def fix_pydantic_compatibility():
    print("Fixing Pydantic model_dump compatibility...")
    file_path = "backend/app/services/lesson_service.py"
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return False
    
    with open(file_path, "r") as f:
        content = f.read()
    
    # Check if model_dump is used and change to dict() for compatibility
    if "model_dump" in content:
        updated_content = re.sub(r'\.model_dump\(mode=\'json\'\)', '.dict()', content)
        
        if updated_content != content:
            with open(file_path, "w") as f:
                f.write(updated_content)
            print("Fixed Pydantic model_dump compatibility issue.")
            return True
        else:
            print("No changes needed for Pydantic compatibility.")
    else:
        print("No model_dump calls found in the file.")
    return False

# Fix 3: Fix the prompt_builder import in lesson_service.py
def fix_prompt_builder_import():
    print("Checking prompt_builder import in lesson_service.py...")
    file_path = "backend/app/services/lesson_service.py"
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return False
    
    with open(file_path, "r") as f:
        content = f.read()
    
    # Check if prompt_builder is accessed without proper import or qualification
    if "prompt_builder.build_continuation_prompt" in content:
        # Fix missing import qualification
        updated_content = content.replace(
            "prompt_builder.build_continuation_prompt", 
            "build_continuation_prompt"
        )
        
        if updated_content != content:
            with open(file_path, "w") as f:
                f.write(updated_content)
            print("Fixed prompt_builder import issue.")
            return True
    
    return False

# Run all fixes
print("Starting fix script...")
fix_prompt_builder_indentation()
fix_pydantic_compatibility()
fix_prompt_builder_import()
print("Fix script completed.") 