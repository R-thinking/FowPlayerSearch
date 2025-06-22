# FOW Crawler Setup Guide

## Overview
This Electron app now includes a Python Flask API for crawling League of Legends ranking data from [FOW.LOL](https://www.fow.lol/ranking#1,kr,1).

## Features
- ✅ Web scraping of FOW.LOL ranking tables
- ✅ Support for multiple regions (KR, NA, EUW, EUN, JP, OCE)
- ✅ Real-time data fetching with Korean column headers
- ✅ CSV export functionality
- ✅ Modern React UI with TypeScript
- ✅ Selenium + BeautifulSoup dual scraping methods

## Column Headers (Korean)
- 순위 (Rank)
- 플레이어 이름 (Player Name)
- 티어 (Tier)
- LP (League Points)
- 승률 (Win Rate)
- 모스트 챔피언 (Most Played Champions)

## Prerequisites

### 1. Python Environment
```bash
# Install Python 3.8+ if not already installed
python --version

# Install pip if not available
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

### 2. Chrome Browser
The crawler uses Chrome WebDriver, so ensure Chrome is installed:
- Download from: https://www.google.com/chrome/

### 3. ChromeDriver (Auto-managed by Selenium 4.15+)
Selenium 4.15+ automatically manages ChromeDriver, but you can manually install if needed:
```bash
# macOS with Homebrew
brew install chromedriver

# Or download from: https://chromedriver.chromium.org/
```

## Installation

### 1. Install Python Dependencies
```bash
# From the project root directory
npm run setup:python

# Or manually:
cd python_api
pip install -r ../requirements.txt
```

### 2. Install Node Dependencies (if not done already)
```bash
npm install
```

## Running the Application

### Option 1: Full Stack (Recommended)
Run Vite dev server, Python API, and Electron together:
```bash
npm run dev:full
```

### Option 2: Separate Terminals
Terminal 1 - Vite Dev Server:
```bash
npm run dev:vite
```

Terminal 2 - Python API:
```bash
npm run dev:api
```

Terminal 3 - Electron App:
```bash
npm run dev:electron
```

### Option 3: Python API Only
```bash
cd python_api
python run.py
```

## API Endpoints

Once running, the API will be available at `http://localhost:5001`:

- **Health Check**: `GET /api/health`
- **Get Ranking Data**: `GET /api/ranking?region=kr&page=1&method=selenium`
- **Export CSV**: `GET /api/ranking/export?region=kr&page=1`

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:5001/api/health

# Get ranking data
curl "http://localhost:5001/api/ranking?region=kr&page=1&method=selenium"

# Export CSV
curl "http://localhost:5001/api/ranking/export?region=kr&page=1" -o ranking.csv
```

## Usage in Electron App

1. **Start the application** using `npm run dev:full`
2. **Check API status** - Should show "Connected" in green
3. **Select region** from dropdown (Korea, North America, etc.)
4. **Set page number** (usually 1 for top players)
5. **Click "Fetch Ranking Data"** to crawl the data
6. **View results** in the table below
7. **Export to CSV** if needed

## Troubleshooting

### Common Issues

#### 1. API Status shows "Disconnected"
- Ensure Python API is running on port 5000
- Check if port 5000 is already in use
- Run `npm run dev:api` separately to see error messages

#### 2. Chrome/ChromeDriver Issues
```bash
# Update Chrome to latest version
# Clear Chrome cache
# Restart the API server
```

#### 3. No Data Returned
- FOW.LOL might be blocking requests
- Try different regions or pages
- Check the browser console for CORS errors
- Verify the website structure hasn't changed

#### 4. CORS Errors
The Flask API includes CORS headers, but if issues persist:
```python
# In python_api/app.py, CORS is already configured
CORS(app)  # This should handle cross-origin requests
```

### Development Tips

#### 1. Debug Mode
The Python API runs in debug mode by default, showing detailed error messages.

#### 2. Logging
Check the terminal running the Python API for detailed logs:
```
INFO:__main__:Crawling URL: https://www.fow.lol/ranking#1,kr,1
INFO:__main__:Successfully crawled 50 records
```

#### 3. Method Selection
- `selenium`: More reliable, handles JavaScript
- `requests`: Faster, but may not work if site uses dynamic content

## File Structure
```
FowCrawler/
├── python_api/
│   ├── app.py          # Main Flask application
│   └── run.py          # API runner script
├── requirements.txt    # Python dependencies
├── src/
│   ├── App.tsx        # React UI with crawler interface
│   └── index.js       # Electron main process
└── package.json       # Node.js dependencies and scripts
```

## Next Steps

### Potential Enhancements
1. **Database Storage** - Store crawled data in SQLite/PostgreSQL
2. **Scheduled Crawling** - Automatic data updates
3. **Data Visualization** - Charts and graphs for ranking trends
4. **Multiple Pages** - Batch crawling of multiple pages
5. **Player History** - Track individual player progress
6. **Rate Limiting** - Respectful crawling with delays

### Security Considerations
- The crawler respects robots.txt (if implemented)
- Uses appropriate delays between requests
- Includes proper User-Agent headers
- Consider implementing request throttling for production use 