# GitHub Actions Setup for FowCrawler

This document explains how to set up and use GitHub Actions to build Windows, macOS, and Linux executables automatically.

## 🎯 What's Included

We've set up two GitHub Actions workflows:

### 1. `build-test.yml` - Manual Build Testing
- **Purpose**: Test builds without creating releases
- **Trigger**: Manual only (via GitHub Actions UI)
- **Platforms**: Choose Windows, macOS, Linux, or all
- **Output**: Downloadable artifacts (7-day retention)

### 2. `build-release.yml` - Automatic Releases
- **Purpose**: Create official releases with executables
- **Trigger**: When you push a version tag (e.g., `v1.0.0`)
- **Platforms**: Builds for all platforms automatically
- **Output**: GitHub Release with downloadable assets

## 🚀 Quick Start

### Option A: Test Build (Manual)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions build setup"
   git push origin main
   ```

2. **Trigger a test build:**
   - Go to your GitHub repository
   - Click "Actions" tab
   - Click "Build Test" workflow
   - Click "Run workflow" 
   - Select "windows" (or "all" for all platforms)
   - Click "Run workflow"

3. **Download the result:**
   - Wait for build completion (~10-15 minutes)
   - Click on the completed workflow run
   - Download artifacts from the "Artifacts" section

### Option B: Create Release (Automatic)

1. **Create and push a version tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub automatically:**
   - Builds for all platforms
   - Creates a GitHub Release
   - Uploads executables as release assets

## 📁 What You'll Get

### Windows Build Outputs
- `FowCrawler-Setup.exe` - Windows installer (recommended for distribution)
- `FowCrawler-win32-x64.zip` - Portable version (no installation required)
- `FowCrawler-1.0.0-full.nupkg` - Squirrel update package

### macOS Build Outputs
- `FowCrawler-darwin-x64.zip` - macOS application bundle

### Linux Build Outputs
- `FowCrawler-Linux.deb` - Debian/Ubuntu package
- `FowCrawler-Linux.rpm` - RedHat/CentOS package (if configured)
- `FowCrawler-linux-x64.zip` - Portable Linux version

## ⚙️ Customization

### Changing Build Settings

Edit `.github/workflows/build-test.yml` or `.github/workflows/build-release.yml` to:
- Change Node.js version
- Update Python version
- Modify build commands
- Add additional platforms
- Change artifact retention periods

### Adding Code Signing

For production releases, you may want to add code signing:

1. **Add secrets to your GitHub repository:**
   - Windows: `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`
   - macOS: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`

2. **Update the workflow files** to include signing steps

## 🔧 Troubleshooting

### Build Fails

1. **Check the workflow logs:**
   - Go to Actions tab
   - Click on the failed workflow
   - Expand the failed step to see error details

2. **Common issues:**
   - Missing `requirements.txt` file
   - Python dependencies not installing
   - Node.js version compatibility
   - Missing files in build output

### Python API Integration

The builds automatically include the Python API server. Make sure:
- `python_api/` folder exists in your repository
- `requirements.txt` is in the root directory
- Python dependencies are compatible with the target platform

### Large File Sizes

Electron apps are typically large (~150-200MB) because they include:
- Electron runtime (~100MB)
- Python interpreter and dependencies (~50MB)
- Your app code and assets (~10MB)

This is normal for Electron applications.

## 📋 Checklist

Before triggering builds, ensure:

- [ ] All code is committed and pushed to GitHub
- [ ] `requirements.txt` exists and is up to date
- [ ] `python_api/` folder is included in the repository
- [ ] `package.json` has correct app metadata
- [ ] No sensitive data (API keys, passwords) in the code

## 🎉 Next Steps

1. **Test the build process** with a manual build
2. **Verify the executable works** on the target platform
3. **Create your first release** with a version tag
4. **Share your app** with the generated executables

---

**Need help?** Check the workflow logs in GitHub Actions or refer to the [BUILD_WINDOWS.md](BUILD_WINDOWS.md) guide for more details. 