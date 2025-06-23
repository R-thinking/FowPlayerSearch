# macOS Installation Guide for FowCrawler

## 🚨 "App is damaged" Error Fix

If you see the error **"FowCrawler is damaged and can't be opened"**, this is due to macOS Gatekeeper security. The app is not code-signed with an Apple Developer certificate.

### Method 1: Right-Click Open (Recommended)

1. **Download** the `FowCrawler-macOS.zip` file
2. **Extract** the ZIP file to get the `FowCrawler.app`
3. **Right-click** on `FowCrawler.app`
4. **Select "Open"** from the context menu
5. **Click "Open"** in the security dialog that appears
6. The app should now launch successfully

### Method 2: System Preferences Override

1. Try to open the app normally (it will fail)
2. Go to **System Preferences** → **Security & Privacy**
3. Click the **"Open Anyway"** button next to the FowCrawler message
4. The app should now launch

### Method 3: Terminal Command (Advanced)

If the above methods don't work, you can remove the quarantine attribute:

```bash
# Navigate to where you extracted the app
cd ~/Downloads  # or wherever you extracted it

# Remove quarantine attribute
xattr -d com.apple.quarantine FowCrawler.app

# Make it executable
chmod +x FowCrawler.app/Contents/MacOS/FowCrawler
```

## 🐍 Python Requirements

FowCrawler requires Python 3.8+ to be installed on your system:

### Install Python (if not already installed)

1. **Download Python** from [python.org](https://www.python.org/downloads/)
2. **Install Python 3.8+** (recommended: Python 3.11)
3. **Verify installation** by opening Terminal and running:
   ```bash
   python3 --version
   ```

### Install Required Python Packages

Open Terminal and run:

```bash
# Install required packages
pip3 install flask selenium beautifulsoup4 pandas requests webdriver-manager

# Or if you have the requirements.txt file:
pip3 install -r requirements.txt
```

## 🚀 First Launch

1. **Open the app** using one of the methods above
2. **Wait for Python API to start** (may take 30-60 seconds on first launch)
3. **Check Console.app** if the app doesn't respond (search for "FowCrawler" logs)

## 🔧 Troubleshooting

### App Opens But Shows Blank Screen

1. **Check Python installation**: `python3 --version`
2. **Install missing packages**: Run the pip3 commands above
3. **Check Console logs**: Open Console.app and search for "FowCrawler"
4. **Restart the app** after installing Python dependencies

### App Won't Start Python API

The app automatically tries to start the Python backend. If it fails:

1. **Check if Python is in PATH**: `which python3`
2. **Install dependencies manually**: Use the pip3 commands above
3. **Check permissions**: Make sure the app has permission to execute Python

### Still Having Issues?

1. **Check Console.app** for detailed error logs
2. **Try running from Terminal** to see error messages:
   ```bash
   cd /Applications  # or wherever you placed the app
   ./FowCrawler.app/Contents/MacOS/FowCrawler
   ```

## 📋 System Requirements

- **macOS**: 10.15 (Catalina) or later
- **Python**: 3.8 or later
- **Memory**: 4GB RAM minimum
- **Storage**: 500MB free space

## 🔒 Security Note

This app is not code-signed because it's an open-source project without an Apple Developer certificate ($99/year). The security warnings are normal and can be safely bypassed using the methods above.

The app is safe to use - you can review the source code at: [GitHub Repository](https://github.com/R-thinking/FowPlayerSearch) 