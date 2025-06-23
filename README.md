# FowCrawler

A desktop application for crawling and analyzing League of Legends ranking data from FOW.LOL.

## Features

- 🎯 **Single Page Search**: Search specific ranking pages
- 📊 **Multi-Page Crawling**: Crawl multiple pages with real-time progress tracking
- 🔍 **Win Rate Filtering**: Filter players by win rate percentage
- 📈 **Real-time Progress**: Live updates with WebSocket support
- 💾 **Export to CSV**: Export search results for further analysis
- 🌍 **Multiple Regions**: Support for different League of Legends regions

## Development

### Prerequisites

- Node.js (v16 or higher)
- Python 3.7+ 
- Chrome/Chromium browser (for Selenium)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

**For development, use the correct startup command:**

```bash
# ✅ CORRECT: Starts both Python API and Electron app
npm run start:all

# ❌ WRONG: Only starts Electron (API won't work)
npm run start
```

**Alternative development commands:**
```bash
# Full development with Vite hot reload
npm run dev:full

# Manual startup (separate terminals)
npm run dev:api    # Terminal 1: Start Python API
npm run dev:vite   # Terminal 2: Start Vite dev server  
npm run dev:electron # Terminal 3: Start Electron
```

### Building for Production

```bash
# Build for current platform
npm run build

# Build for Windows (from any platform)
npm run build:win
```

### Architecture

- **Frontend**: React + TypeScript + Styled Components
- **Backend**: Python Flask API with WebSocket support
- **Desktop**: Electron wrapper
- **Web Scraping**: Selenium + BeautifulSoup
- **API Port**: 5002 (cross-platform compatible)

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/ranking` - Single page ranking data
- `POST /api/ranking/multi` - Multi-page crawling
- `GET /api/progress` - Real-time progress updates
- `GET /api/ranking/export` - Export data as CSV

### Troubleshooting

**Connection Issues:**
- Make sure to use `npm run start:all` for development
- Check that Python API is running on port 5002
- Verify Chrome/Chromium is installed for Selenium

**Windows-specific:**
- Install Python from python.org with "Add to PATH" checked
- Run as Administrator if permission issues occur
- Check Windows Defender isn't blocking Python 