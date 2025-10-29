"""
Utility module for loading environment variables from parent directory .env file.
Can be imported in any subfolder to access environment variables.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

def load_parent_env():
    """
    Load .env file from the parent directory (project root).
    Returns the path to the .env file that was loaded.
    """
    # Get the current file's directory
    current_dir = Path(__file__).parent
    
    # Go up to project root (parent of utils/)
    parent_dir = current_dir.parent
    
    # Path to .env file in project root
    env_path = parent_dir / '.env'
    
    # Load the .env file
    load_dotenv(dotenv_path=env_path)
    
    return env_path

# Auto-load when this module is imported
load_parent_env()

# Helper function to get env var with optional default
def get_env(key: str, default: str = None, required: bool = False) -> str:
    """
    Get environment variable value.
    
    Args:
        key: Environment variable name
        default: Default value if not found
        required: If True, raise error if variable not found
    
    Returns:
        Environment variable value
    """
    value = os.getenv(key, default)
    if required and value is None:
        raise ValueError(f"{key} is required but not found in environment variables")
    return value

