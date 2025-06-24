#!/usr/bin/env python3
"""
PyInstaller build script for FowCrawler Python API
Creates a standalone executable that includes Python interpreter and all dependencies
"""

import PyInstaller.__main__
import os
import sys
import shutil
from pathlib import Path

def build_api_executable():
    """Build the Python API as a standalone executable using PyInstaller"""
    
    # Get the directory containing this script
    script_dir = Path(__file__).parent.absolute()
    
    # Define paths
    api_script = script_dir / "run.py"
    dist_dir = script_dir / "dist"
    build_dir = script_dir / "build"
    
    # Clean previous builds
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    if build_dir.exists():
        shutil.rmtree(build_dir)
    
    print(f"🔨 Building FowCrawler API executable...")
    print(f"📁 Script directory: {script_dir}")
    print(f"🐍 Python script: {api_script}")
    
    # PyInstaller arguments
    pyinstaller_args = [
        str(api_script),                    # Main script
        "--onefile",                        # Create single executable file
        "--name=fowcrawler-api",           # Name of the executable
        "--distpath", str(dist_dir),       # Output directory
        "--workpath", str(build_dir),      # Build directory
        "--specpath", str(script_dir),     # Spec file location
        "--console",                       # Keep console window (for debugging)
        "--add-data", f"{script_dir}/app.py{os.pathsep}.",  # Include app.py
        "--hidden-import=flask",           # Ensure Flask is included
        "--hidden-import=flask_cors",      # Ensure Flask-CORS is included
        "--hidden-import=selenium",        # Ensure Selenium is included
        "--hidden-import=bs4",             # Ensure BeautifulSoup is included
        "--hidden-import=pandas",          # Ensure Pandas is included
        "--hidden-import=requests",        # Ensure Requests is included
        "--hidden-import=urllib3",         # Selenium dependency
        "--hidden-import=webdriver_manager", # Selenium WebDriver manager
        "--collect-all=selenium",          # Include all Selenium files
        "--collect-all=webdriver_manager", # Include all WebDriver manager files
        "--noconfirm",                     # Overwrite without asking
    ]
    
    # Platform-specific settings
    if sys.platform == "win32":
        pyinstaller_args.extend([
            "--icon=../assets/icon.ico",   # Windows icon
        ])
    elif sys.platform == "darwin":
        pyinstaller_args.extend([
            "--icon=../assets/icon.icns",  # macOS icon
        ])
    
    print(f"🚀 Running PyInstaller with args: {' '.join(pyinstaller_args)}")
    
    try:
        # Run PyInstaller
        PyInstaller.__main__.run(pyinstaller_args)
        
        # Check if build was successful
        if sys.platform == "win32":
            exe_path = dist_dir / "fowcrawler-api.exe"
        else:
            exe_path = dist_dir / "fowcrawler-api"
            
        if exe_path.exists():
            print(f"✅ Build successful!")
            print(f"📦 Executable created: {exe_path}")
            print(f"📏 File size: {exe_path.stat().st_size / (1024*1024):.1f} MB")
            return str(exe_path)
        else:
            print(f"❌ Build failed - executable not found at {exe_path}")
            return None
            
    except Exception as e:
        print(f"❌ Build failed with error: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        # Check if PyInstaller is available
        try:
            import PyInstaller
            print("✅ PyInstaller is available")
            print(f"📦 PyInstaller version: {PyInstaller.__version__}")
        except ImportError:
            print("❌ PyInstaller not found. Install with: pip install pyinstaller")
            sys.exit(1)
    else:
        # Build the executable
        result = build_api_executable()
        if result:
            print(f"\n🎉 Success! Executable ready at: {result}")
        else:
            print(f"\n💥 Build failed!")
            sys.exit(1) 