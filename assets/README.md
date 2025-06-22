# FowCrawler Icons

This directory contains the icon assets for the FowCrawler application.

## Files

- **icon.svg** - Source SVG icon (vector format)
- **icon.png** - 256x256 PNG icon for general use
- **icon.ico** - Windows icon file (multiple sizes: 16, 32, 48, 64, 128, 256)
- **icon.icns** - macOS icon file (multiple sizes and retina variants)

## Icon Design

The icon features:
- **FOW** text representing the fow.kr inspiration
- **CRAWLER** subtitle indicating the app's functionality
- League of Legends themed blue color scheme (#1e3c72, #2a5298)
- Gold accent elements (#ffd700) representing data points
- Magnifying glass icon symbolizing search functionality

## Usage

The icons are automatically used by:
- Electron Forge for application packaging
- Windows installer (Squirrel)
- macOS app bundle
- Browser favicon (in HTML template)

## Regeneration

To regenerate icons from the SVG source:

```bash
# Install ImageMagick
brew install imagemagick

# Generate PNG
magick assets/icon.svg -resize 256x256 assets/icon.png

# Generate ICO (Windows)
magick assets/icon.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico

# Generate ICNS (macOS) - requires additional steps with iconutil
```

The icons are inspired by the fow.kr League of Legends statistics website and designed to represent the data crawling functionality of the FowCrawler application. 