# Windows Installation Guide for FowCrawler

## 🚀 Installation

### Method 1: Installer (Recommended)

1. **Download** `FowCrawler-Setup.exe` from the release
2. **Run the installer** (you may see Windows Defender warnings)
3. **Click "More info"** → **"Run anyway"** if Windows Defender blocks it
4. **Follow the installation wizard**
5. **Launch from Start Menu** or Desktop shortcut

### Method 2: Portable Version

1. **Download** `FowCrawler-Windows.zip`
2. **Extract** to a folder (e.g., `C:\FowCrawler\`)
3. **Run** `FowCrawler.exe` from the extracted folder

## 🐍 Python Requirements

FowCrawler now includes all Python dependencies automatically! You only need Python itself installed:

### Install Python (Required)

1. **Download Python 3.8+** from [python.org](https://www.python.org/downloads/windows/)
2. **Check "Add Python to PATH"** during installation
3. **Verify installation** by opening Command Prompt and running:
   ```cmd
   python --version
   ```

**Note**: You no longer need to manually install packages like Flask, Selenium, etc. - they're included with the app!

## 🔧 Troubleshooting

### App Opens But Shows Nothing/Blank Screen

This usually means the Python API backend isn't starting properly.

#### Solution 1: Check Python Installation

1. **Open Command Prompt**
2. **Run**: `python --version` or `python3 --version`
3. **If not found**: Install Python from python.org
4. **Restart the app** after installing Python

#### Solution 2: Install Dependencies Manually

Python dependencies are now included with the app. If you're still having issues:

```cmd
# Only install Python itself - dependencies are bundled
# Check if Python is properly installed
python --version
```

#### Solution 3: Check Windows Defender/Antivirus

1. **Windows Defender** might be blocking the Python process
2. **Add exception** for the FowCrawler installation folder
3. **Temporarily disable** real-time protection to test

### Windows Defender SmartScreen Warning

If you see "Windows protected your PC":

1. **Click "More info"**
2. **Click "Run anyway"**
3. This is normal for unsigned applications

### App Won't Start at All

#### Check for Missing Dependencies

1. **Install Visual C++ Redistributable**:
   - Download from Microsoft's website
   - Install both x64 and x86 versions

2. **Install .NET Framework** (if needed):
   - Usually pre-installed on Windows 10/11
   - Download from Microsoft if missing

#### Run as Administrator

1. **Right-click** on FowCrawler.exe
2. **Select "Run as administrator"**
3. This can help with permission issues

### Python API Won't Start

If the app opens but the backend doesn't work:

#### Check Python PATH

1. **Open Command Prompt**
2. **Run**: `where python` or `where python3`
3. **If not found**: Reinstall Python with "Add to PATH" checked

#### Manual Dependency Installation

```cmd
# Navigate to the app directory
cd "C:\Program Files\FowCrawler" # or wherever installed

# Dependencies are now bundled with the app!
# You only need Python itself installed
python --version
```

#### Check for Port Conflicts

The app uses port 5001 by default. If another app is using it:

1. **Close other applications** that might use port 5001
2. **Restart FowCrawler**

### Performance Issues

#### Chrome/Selenium Issues

1. **Update Chrome** to the latest version
2. **Clear Chrome cache** and restart
3. **Close other Chrome instances** before using the app

#### Memory Issues

1. **Close unnecessary programs**
2. **Ensure 4GB+ RAM available**
3. **Check Task Manager** for high memory usage

## 🔍 Getting Debug Information

### Method 1: Run from Command Prompt

1. **Open Command Prompt**
2. **Navigate to app directory**:
   ```cmd
   cd "C:\Program Files\FowCrawler"
   ```
3. **Run the app**:
   ```cmd
   FowCrawler.exe
   ```
4. **Check console output** for error messages

### Method 2: Check Event Viewer

1. **Open Event Viewer** (Windows + R, type `eventvwr`)
2. **Navigate to**: Windows Logs → Application
3. **Look for FowCrawler entries** with errors

## 📋 System Requirements

- **Windows**: 10 or later (64-bit recommended)
- **Python**: 3.8 or later
- **Memory**: 4GB RAM minimum
- **Storage**: 1GB free space
- **Internet**: Required for League of Legends data fetching

## 🛡️ Security Notes

### Windows Defender Warnings

The app may trigger Windows Defender because:
- It's not code-signed (requires expensive certificate)
- It uses web scraping (Selenium/ChromeDriver)
- It makes network requests

**The app is safe** - you can review the source code at: [GitHub Repository](https://github.com/R-thinking/FowPlayerSearch)

### Firewall Settings

If the app can't connect to League of Legends APIs:
1. **Allow FowCrawler** through Windows Firewall
2. **Check corporate/antivirus firewalls**

## 🆘 Still Need Help?

1. **Check the GitHub Issues**: [Issues Page](https://github.com/R-thinking/FowPlayerSearch/issues)
2. **Run with debug output** using Command Prompt method above
3. **Include error messages** when reporting issues 