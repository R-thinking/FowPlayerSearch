# FowCrawler Build Troubleshooting

## Common Build Issues and Solutions

### 1. "Fatal error: Unable to set icon" Error

This error occurs when the Windows build process cannot find or use the specified icon files.

#### Symptoms:
```
✖ Making a squirrel distributable for win32/x64 [FAILED: Failed with exit code: 1
Output:
Fatal error: Unable to set icon
]
```

#### Solutions:

**Solution 1: Verify Icons Exist**
```bash
npm run verify-icons
```
This will check if all required icon files are present and show their sizes.

**Solution 2: Use Fallback Configuration (No Icons)**
If icon issues persist, use the fallback build without icons:
```bash
npm run build:win-fallback
# or
npm run make:win-fallback
```

**Solution 3: Manual Icon Regeneration**
If icons are corrupted or missing:
```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Regenerate icons from SVG
cd assets
magick icon.svg -resize 256x256 icon.png
magick icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# For macOS icons (if needed)
mkdir icon.iconset
# ... (see assets/README.md for full instructions)
iconutil -c icns icon.iconset
```

### 2. GitHub Actions Build Failures

#### Check Icon Verification Step
The GitHub Actions workflow now includes an icon verification step. Check the logs for:
```
🔍 Verifying icon files...
✅ icon.ico - 109KB
✅ icon.icns - 1184KB  
✅ icon.png - 21KB
✅ icon.svg - 1KB
🎉 All icon files verified successfully!
```

If this step fails, the icons are missing from the repository.

#### Fallback Option for CI
If needed, you can modify the GitHub Actions workflow to use the fallback configuration:
```yaml
- name: Build Electron app for Windows (Fallback)
  run: npm run build:win-fallback
```

### 3. Path Resolution Issues

The forge configuration now uses `path.join(__dirname, 'assets', 'icon')` for more robust path handling across different operating systems.

### 4. Node.js Deprecation Warnings

You may see warnings like:
```
(node:1236) [DEP0147] DeprecationWarning: In future versions of Node.js, fs.rmdir(path, { recursive: true }) will be removed
```

These are harmless warnings from dependencies and don't affect the build.

### 5. Build Environment Differences

#### Local vs CI Environment
- **Local builds** (macOS/Linux): May work even with relative paths
- **CI builds** (Windows): Require absolute paths and proper icon formats

#### Testing Locally
```bash
# Test packaging (doesn't create installer)
npm run package

# Test full Windows build (if on Windows or with Wine)
npm run make:win64

# Test icon verification
npm run verify-icons
```

### 6. Python Dependency Installation Issues

#### Symptoms:
```
Installing collected packages: ...
ERROR: Operation cancelled by user
```

#### Solutions:

**Solution 1: Test Python Dependencies Locally**
```bash
npm run test-python-deps
```
This will test if Python dependencies can be installed without actually installing them.

**Solution 2: Skip Python Dependencies**
The Electron build doesn't require Python dependencies to be pre-installed in CI. The app will install them at runtime. The GitHub Actions workflow now continues even if Python installation fails.

**Solution 3: Check Python Environment**
```bash
# Check Python version
python --version

# Check pip version  
pip --version

# Test manual installation
pip install -r requirements.txt --dry-run
```

**Solution 4: Use Different Python Command**
Sometimes `python3` works better than `python`:
```bash
python3 -m pip install -r requirements.txt
```

## Quick Fixes

### For Immediate Builds (Skip Icons)
```bash
npm run build:win-fallback
```

### For Production Builds (With Icons)
```bash
npm run verify-icons && npm run build:win
```

### Reset and Clean Build
```bash
npm run clear-cache
rm -rf out/
npm ci
npm run build:win
```

## Getting Help

If issues persist:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all icon files exist with `npm run verify-icons`
3. Try the fallback build first to isolate icon-related issues
4. Check that `forge.config.js` paths are correct for your environment

## File Structure Reference

```
FowCrawler/
├── assets/
│   ├── icon.svg      # Source vector icon
│   ├── icon.png      # 256x256 PNG
│   ├── icon.ico      # Windows multi-size icon
│   ├── icon.icns     # macOS icon bundle
│   └── README.md     # Icon documentation
├── forge.config.js   # Main Electron Forge config (with icons)
├── forge.config.no-icons.js  # Fallback config (no icons)
└── scripts/
    └── verify-icons.js  # Icon verification script
``` 