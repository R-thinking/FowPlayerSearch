# FowCrawler Windows Installation Guide

## Prerequisites

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS version
   - During installation, make sure "Add to PATH" is checked

2. **Python 3.7+**
   - Download from: https://www.python.org/downloads/windows/
   - **IMPORTANT**: During installation, check "Add Python to PATH"
   - Choose "Install for all users" if you have admin rights

3. **Google Chrome or Chromium**
   - Download from: https://www.google.com/chrome/
   - Required for web scraping functionality

## Installation Steps

1. **Clone or Download the Repository**
   ```cmd
   git clone <repository-url>
   cd FowCrawler
   ```

2. **Install Node.js Dependencies**
   ```cmd
   npm install
   ```

3. **Install Python Dependencies**
   ```cmd
   pip install -r requirements.txt
   ```

4. **Verify Installation**
   ```cmd
   python --version
   node --version
   npm --version
   ```

## Running the Application

### ✅ Development Mode (Recommended)

**Use the correct startup command:**
```cmd
npm run start:all
```

This command will:
- Start the Python API server on port 5002
- Start the Vite development server on port 3000
- Launch the Electron application
- Enable hot reloading for development

### ❌ Common Mistake

**DON'T use this command for development:**
```cmd
npm run start
```
This only starts Electron without the Python API, causing connection errors.

### Alternative Development Commands

If you prefer manual control:
```cmd
# Terminal 1: Start Python API
npm run dev:api

# Terminal 2: Start Vite dev server
npm run dev:vite

# Terminal 3: Start Electron app
npm run dev:electron
```

## Building for Production

```cmd
# Build for Windows
npm run build:win

# The built application will be in the out/ directory
```

## Troubleshooting

### Python API Connection Issues

**Problem**: "Failed to load resource GET http://localhost:5002/api/health"

**Solutions**:
1. **Use correct startup command**: `npm run start:all` (not `npm run start`)
2. **Check Python installation**:
   ```cmd
   python --version
   python -c "import flask; print('Flask installed')"
   ```
3. **Verify Python is in PATH**:
   ```cmd
   where python
   ```

### Python Not Found Errors

**Problem**: "'python' is not recognized as an internal or external command"

**Solutions**:
1. **Reinstall Python** with "Add to PATH" checked
2. **Restart Command Prompt** after Python installation
3. **Try alternative commands**:
   ```cmd
   python3 --version
   py --version
   ```

### Permission Denied Errors

**Problem**: "Permission denied" or "Access is denied"

**Solutions**:
1. **Run Command Prompt as Administrator**
2. **Check Windows Defender** - it may be blocking Python
3. **Disable antivirus temporarily** during installation

### Chrome/Selenium Issues

**Problem**: Selenium can't find Chrome driver

**Solutions**:
1. **Install Google Chrome** from official website
2. **Update Chrome** to latest version
3. **Check Chrome installation path**:
   - Usually: `C:\Program Files\Google\Chrome\Application\chrome.exe`

### Port Already in Use

**Problem**: "Port 5002 is already in use"

**Solutions**:
1. **Kill existing processes**:
   ```cmd
   taskkill /f /im python.exe
   taskkill /f /im node.exe
   ```
2. **Check what's using the port**:
   ```cmd
   netstat -ano | findstr :5002
   ```

### Module Not Found Errors

**Problem**: "ModuleNotFoundError: No module named 'flask'"

**Solutions**:
1. **Reinstall Python dependencies**:
   ```cmd
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
2. **Use pip3 if pip doesn't work**:
   ```cmd
   pip3 install -r requirements.txt
   ```
3. **Install packages individually**:
   ```cmd
   pip install flask flask-cors selenium beautifulsoup4 pandas requests
   ```

## Development Tips

1. **Use Windows Terminal** or PowerShell for better experience
2. **Keep Chrome updated** for Selenium compatibility
3. **Use `npm run start:all`** for development - it handles everything
4. **Check the console output** for detailed error messages
5. **Enable Windows Developer Mode** for better debugging

## Production Build Notes

- The production build includes all Python dependencies
- Chrome driver is bundled automatically
- No manual Python installation needed for end users
- Built application is portable and self-contained

## Getting Help

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify all prerequisites are installed correctly
3. Try running `npm run start:all` instead of `npm run start`
4. Check Windows Defender/antivirus settings
5. Run Command Prompt as Administrator if needed 