# Building Windows Executable for FowCrawler

This guide explains how to build a Windows executable (.exe) file for the FowCrawler application.

## 🚀 Method 1: GitHub Actions (Recommended)

**The easiest way to build Windows executables is using GitHub Actions.** This method works from any platform and doesn't require installing additional software.

### Quick Start

1. **Push your code to GitHub** (if not already there)
2. **Go to your GitHub repository**
3. **Click "Actions" tab**
4. **Click "Build Test" workflow**
5. **Click "Run workflow"**
6. **Select "windows" platform**
7. **Click "Run workflow" button**

### Steps in Detail

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Ready for Windows build"
   git push origin main
   ```

2. **Trigger the build:**
   - Go to `https://github.com/YOUR_USERNAME/FowCrawler/actions`
   - Click on "Build Test" workflow
   - Click "Run workflow" dropdown
   - Select platform: "windows" (or "all" for all platforms)
   - Click "Run workflow"

3. **Download the executable:**
   - Wait for the build to complete (~10-15 minutes)
   - Click on the completed workflow run
   - Scroll down to "Artifacts" section
   - Download "FowCrawler-Windows-Test"
   - Extract the ZIP file to find your executable

### For Releases

To create a proper release with automatic distribution:

1. **Create a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub will automatically:**
   - Build for Windows, macOS, and Linux
   - Create a GitHub Release
   - Upload all executables as release assets
   - Generate release notes

## Method 2: Local Build (Advanced)

If you prefer to build locally, you'll need additional setup.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Python 3.8+** with required dependencies
3. **Git** (for version control)

## Quick Build Commands

### 1. Build for Windows (64-bit) - Recommended
```bash
npm run build:win
```
This will:
- Build the React frontend with Vite
- Package the Electron app for Windows
- Create a Windows installer (.exe)

### 2. Alternative Build Commands

**For 64-bit Windows only:**
```bash
npm run make:win64
```

**For 32-bit Windows only:**
```bash
npm run make:win32
```

**For both architectures:**
```bash
npm run make:win
```

## Build Process

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build Frontend:**
   ```bash
   npm run build
   ```

3. **Create Windows Executable:**
   ```bash
   npm run make:win
   ```

## Output Files

### GitHub Actions Output
After the GitHub Actions build completes, download the artifact ZIP file. Inside you'll find:
```
FowCrawler-Windows-Test/
├── squirrel.windows/
│   ├── x64/
│   │   ├── FowCrawler-Setup.exe          # Main installer
│   │   └── FowCrawler-1.0.0-full.nupkg   # Update package
└── zip/
    └── win32/
        └── x64/
            └── FowCrawler-win32-x64.zip   # Portable version
```

### Local Build Output
After building locally, you'll find the Windows executable in:
```
out/make/squirrel.windows/
├── FowCrawler-Setup.exe          # Windows installer
└── FowCrawler-1.0.0-full.nupkg   # Squirrel update package
```

## Installation & Distribution

### For End Users:
- **Distribute:** `FowCrawler-Setup.exe`
- **Size:** ~150-200MB (includes Electron runtime + Python dependencies)
- **Installation:** Double-click to install, creates desktop shortcut
- **Updates:** Supports automatic updates via Squirrel

### Manual Installation:
You can also distribute the packaged folder from:
```
out/FowCrawler-win32-x64/
```

## Important Notes

### Python API Integration
The Windows build includes the Python API server that runs locally on port 5000. Make sure:

1. **Python Dependencies** are included:
   ```bash
   npm run setup:python
   ```

2. **API Server** starts automatically with the app (handled by Electron main process)

### File Structure in Build
```
FowCrawler.exe
├── resources/
│   ├── app.asar              # Main app code
│   └── python_api/           # Python backend
├── locales/                  # Electron localization
└── [Electron runtime files]
```

### Troubleshooting

**Build fails on macOS/Linux for Windows:**
- Cross-platform building is supported but may require additional setup
- Consider using GitHub Actions or Windows VM for reliable builds

**Large file size:**
- The executable is large (~150-200MB) because it includes:
  - Electron runtime (~100MB)
  - Python interpreter and dependencies (~50MB)
  - React app and assets (~10MB)

**Python API not starting:**
- Check that `python_api/` folder is included in the build
- Verify Python dependencies in `requirements.txt`

## Advanced Configuration

### Custom Icon
Replace `assets/icon.ico` with your custom icon (256x256 recommended)

### Installer Customization
Edit `forge.config.js` to customize:
- Company name
- Product description
- Installer appearance
- Update server URLs

### Code Signing (Optional)
For distribution without security warnings, add code signing:
```javascript
// In forge.config.js
packagerConfig: {
  // ... existing config
  osxSign: {}, // For macOS
  win32metadata: {
    // ... existing metadata
    "requested-execution-level": "asInvoker"
  }
}
```

## Testing the Build

1. **Install the generated executable**
2. **Launch FowCrawler**
3. **Test core functionality:**
   - Python API connection (should auto-start)
   - Search functionality
   - Data export features
   - UI responsiveness

## Distribution Checklist

- [ ] Test on clean Windows machine
- [ ] Verify Python API starts correctly
- [ ] Check all search features work
- [ ] Test CSV export functionality
- [ ] Confirm UI displays properly
- [ ] Test different Windows versions (10, 11)

---

**Need help?** Check the main README.md or create an issue on GitHub. 