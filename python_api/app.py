from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import csv
from io import StringIO
import threading
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, origins="*")  # Enable CORS for Electron app
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProgressTracker:
    def __init__(self):
        self.reset()
    
    def reset(self):
        self.start_time = None
        self.total_pages = 0
        self.completed_pages = 0
        self.current_page = 0
        self.all_data = []
        self.page_times = []
        self.is_running = False
        self.error_count = 0
        self.current_page_data = []  # Store current page data for transmission
    
    def start(self, total_pages):
        self.reset()
        self.start_time = datetime.now()
        self.total_pages = total_pages
        self.is_running = True
        self.emit_progress()
    
    def update_page(self, page_num, page_data=None, error=None):
        """Update progress for a specific page"""
        # Don't update current_page here - it's set before crawling starts
        self.current_page_data = page_data if page_data else []
        
        if error:
            self.error_count += 1
            socketio.emit('status_update', {
                'message': f'❌ Page {page_num} failed: {error}',
                'page': page_num,
                'error': True
            })
        else:
            if page_data:
                # Add page number to each record
                for record in page_data:
                    record['페이지'] = page_num
                self.all_data.extend(page_data)
                
            self.completed_pages += 1
            
            # Calculate timing
            if self.start_time:
                elapsed = (datetime.now() - self.start_time).total_seconds()
                self.page_times.append(elapsed)
            
            # Send status update with current page info
            socketio.emit('status_update', {
                'message': f'✅ Page {page_num} completed: {len(page_data) if page_data else 0} records',
                'page': page_num,
                'error': False
            })
        
        self.emit_progress()
    
    def finish(self):
        self.is_running = False
        self.current_page_data = []
        # When finished, current_page should reflect that we've completed all pages
        self.current_page = self.total_pages if self.completed_pages == self.total_pages else self.current_page
        self.emit_progress()
    
    def get_eta(self):
        if not self.page_times or self.completed_pages == 0:
            return None
        
        avg_time_per_page = sum(self.page_times) / len(self.page_times) / self.completed_pages
        remaining_pages = self.total_pages - self.completed_pages
        return remaining_pages * avg_time_per_page
    
    def emit_progress(self):
        eta_seconds = self.get_eta()
        eta_formatted = None
        if eta_seconds:
            eta_time = datetime.now() + timedelta(seconds=eta_seconds)
            eta_formatted = eta_time.strftime("%H:%M:%S")
        
        elapsed_seconds = 0
        if self.start_time:
            elapsed_seconds = (datetime.now() - self.start_time).total_seconds()
        
        progress_data = {
            'total_pages': self.total_pages,
            'completed_pages': self.completed_pages,
            'current_page': self.current_page,
            'remaining_pages': self.total_pages - self.completed_pages,
            'progress_percent': (self.completed_pages / self.total_pages * 100) if self.total_pages > 0 else 0,
            'eta_seconds': eta_seconds,
            'eta_formatted': eta_formatted,
            'elapsed_seconds': elapsed_seconds,
            'is_running': self.is_running,
            'error_count': self.error_count,
            'total_records': len(self.all_data),
            'latest_data': self.current_page_data  # Send current page data instead of last N records
        }
        
        socketio.emit('progress_update', progress_data)

# Global progress tracker
progress_tracker = ProgressTracker()

class FowCrawler:
    def __init__(self):
        self.base_url = "https://www.fow.lol/ranking"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    def setup_driver(self):
        """Setup Chrome driver with anti-detection measures"""
        try:
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            
            # Anti-detection measures
            options.add_argument('--disable-blink-features=AutomationControlled')
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            # Additional anti-bot measures
            options.add_argument('--disable-extensions')
            options.add_argument('--disable-plugins')
            options.add_argument('--disable-images')
            # options.add_argument('--disable-javascript')  # Commented out - site likely needs JS
            
            driver = webdriver.Chrome(options=options)
            
            # Execute script to remove webdriver property
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            return driver
        except Exception as e:
            logger.error(f"Failed to setup Chrome driver: {e}")
            return None
    
    def crawl_ranking_data(self, region='kr', page=1):
        """Crawl FOW.LOL ranking data with improved anti-detection and URL handling"""
        driver = None
        try:
            # Calculate the starting rank based on page number
            # Page 1 = ranks 1-50, Page 2 = ranks 51-100, etc.
            rank_start = (page - 1) * 50 + 1
            
            # Construct URL with correct fow.lol convention
            # Format: https://www.fow.lol/ranking#{rank_start},{region},{game_type}
            # game_type = 1 for 개인/2인 랭크 게임 (Solo/Duo Ranked)
            url = f"{self.base_url}#{rank_start},{region},1"
            
            logger.info(f"Crawling URL: {url} (Page {page} = Ranks {rank_start}-{rank_start + 49})")
            
            driver = self.setup_driver()
            if not driver:
                return {"error": "Failed to setup web driver"}
            
            try:
                logger.info(f"Loading page {page} (ranks {rank_start}-{rank_start + 49})...")
                driver.get(url)
                
                # Wait for page to load
                time.sleep(3)
                
                # Progressive wait strategy
                wait = WebDriverWait(driver, 25)
                
                logger.info(f"Waiting for table to load...")
                # Wait for the table to load
                table = wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                
                logger.info("Table found, waiting for table rows...")
                # Wait for table content to populate with more specific selectors
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr td")))
                except:
                    # Try alternative selectors
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "table tr td")))
                
                # Additional wait for dynamic content
                time.sleep(5)
                
                # Try to scroll down to load more content (in case of lazy loading)
                logger.info("Scrolling to load more content...")
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                
                # Try to find and click "show more" or pagination buttons
                try:
                    show_more_selectors = [
                        "button:contains('더보기')",
                        "button:contains('Show More')",
                        "button:contains('Load More')",
                        ".load-more",
                        ".show-more",
                        ".pagination-next",
                        "[data-action='load-more']"
                    ]
                    
                    for selector in show_more_selectors:
                        try:
                            elements = driver.find_elements(By.CSS_SELECTOR, selector)
                            if elements:
                                logger.info(f"Found show more button with selector: {selector}")
                                elements[0].click()
                                time.sleep(3)
                                break
                        except:
                            continue
                except Exception as e:
                    logger.info(f"No show more button found: {e}")
                
                # Try to handle pagination within the page
                try:
                    # Look for pagination controls or settings
                    pagination_selectors = [
                        "select[name*='pageSize']",
                        "select[name*='limit']",
                        "select[name*='per']",
                        ".page-size-selector",
                        ".items-per-page"
                    ]
                    
                    for selector in pagination_selectors:
                        try:
                            elements = driver.find_elements(By.CSS_SELECTOR, selector)
                            if elements:
                                logger.info(f"Found page size selector: {selector}")
                                # Try to select maximum items per page
                                from selenium.webdriver.support.ui import Select
                                select = Select(elements[0])
                                # Try to select 50 or 100 items per page
                                for option_value in ['50', '100', 'All', '전체']:
                                    try:
                                        select.select_by_value(option_value)
                                        logger.info(f"Selected page size: {option_value}")
                                        time.sleep(3)
                                        break
                                    except:
                                        try:
                                            select.select_by_visible_text(option_value)
                                            logger.info(f"Selected page size by text: {option_value}")
                                            time.sleep(3)
                                            break
                                        except:
                                            continue
                                break
                        except:
                            continue
                except Exception as e:
                    logger.info(f"No page size selector found: {e}")
                
                # Additional scroll and wait after potential pagination changes
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)
                
                logger.info("Extracting table data...")
                # Try multiple row selectors
                row_selectors = [
                    "table tbody tr",
                    "table tr",
                    ".ranking-table tbody tr",
                    ".ranking-table tr",
                    "[class*='table'] tbody tr",
                    "[class*='table'] tr"
                ]
                
                rows = []
                for selector in row_selectors:
                    rows = driver.find_elements(By.CSS_SELECTOR, selector)
                    if rows:
                        logger.info(f"Found {len(rows)} rows using selector: {selector}")
                        break
                
                if not rows:
                    logger.warning(f"No table rows found with any selector for page {page}")
                    return {"error": f"No data found on page {page}"}
                
                # Log the actual HTML structure for debugging
                try:
                    table_html = driver.find_element(By.TAG_NAME, "table").get_attribute('outerHTML')
                    logger.info(f"Table HTML structure (first 500 chars): {table_html[:500]}...")
                except:
                    pass
                
                # Filter out header rows and empty rows
                data_rows = []
                for i, row in enumerate(rows):
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 6:  # Ensure we have enough columns
                        data_rows.append(row)
                        logger.debug(f"Row {i}: {len(cells)} cells - {cells[0].text.strip()}")
                
                if not data_rows:
                    logger.warning(f"No valid data rows found for page {page}")
                    return {"error": f"No valid data rows found on page {page}"}
                
                logger.info(f"Found {len(data_rows)} valid data rows, processing...")
                ranking_data = []
                
                for i, row in enumerate(data_rows):
                    try:
                        cells = row.find_elements(By.TAG_NAME, "td")
                        if len(cells) >= 6:
                            # Extract data from each cell
                            rank = cells[0].text.strip()
                            player_name = cells[1].text.strip()
                            tier = cells[2].text.strip()
                            lp = cells[3].text.strip()
                            win_rate = cells[4].text.strip()
                            most_champions = cells[5].text.strip()
                            
                            logger.debug(f"Processing row {i}: Rank={rank}, Player={player_name}")
                            
                            # Skip empty rows
                            if not rank or not player_name:
                                logger.debug(f"Skipping empty row {i}")
                                continue
                            
                            ranking_data.append({
                                "순위": rank,
                                "플레이어 이름": player_name,
                                "티어": tier,
                                "LP": lp,
                                "승률": win_rate,
                                "모스트 챔피언": most_champions
                            })
                    except Exception as e:
                        logger.warning(f"Error parsing row {i}: {e}")
                        continue
                
                if not ranking_data:
                    return {"error": f"No valid data extracted from page {page}"}
                
                logger.info(f"Successfully crawled {len(ranking_data)} records from page {page}")
                logger.info(f"First few ranks: {[item['순위'] for item in ranking_data[:5]]}")
                logger.info(f"Last few ranks: {[item['순위'] for item in ranking_data[-5:]]}")
                
                return {
                    "success": True,
                    "data": ranking_data,
                    "total_records": len(ranking_data),
                    "region": region,
                    "page": page,
                    "rank_range": f"{rank_start}-{rank_start + 49}",
                    "url_used": url
                }
                        
            except Exception as e:
                logger.error(f"Error during page {page} crawling process: {type(e).__name__}: {str(e)}")
                return {"error": f"Page {page} crawling failed: {type(e).__name__}: {str(e)}"}
                
        except Exception as e:
            logger.error(f"Error setting up crawler for page {page}: {type(e).__name__}: {str(e)}")
            return {"error": f"Setup failed for page {page}: {type(e).__name__}: {str(e)}"}
        finally:
            if driver:
                try:
                    driver.quit()
                except Exception as e:
                    logger.warning(f"Error closing driver: {e}")
    
    def crawl_with_requests_fallback(self, region='kr', page=1):
        """Fallback method using requests + BeautifulSoup when Selenium fails"""
        try:
            # Calculate the starting rank based on page number
            rank_start = (page - 1) * 50 + 1
            
            # Construct URL with correct fow.lol convention
            url = f"{self.base_url}#{rank_start},{region},1"
            
            logger.info(f"Fallback crawling URL: {url} (Page {page} = Ranks {rank_start}-{rank_start + 49})")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            session = requests.Session()
            session.headers.update(headers)
            
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the table
            table = soup.find('table')
            if not table:
                return {"error": f"No table found on page {page} with fallback method"}
            
            rows = table.find_all('tr')
            if not rows:
                return {"error": f"No table rows found on page {page} with fallback method"}
            
            ranking_data = []
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 6:
                    try:
                        rank = cells[0].get_text(strip=True)
                        player_name = cells[1].get_text(strip=True)
                        tier = cells[2].get_text(strip=True)
                        lp = cells[3].get_text(strip=True)
                        win_rate = cells[4].get_text(strip=True)
                        most_champions = cells[5].get_text(strip=True)
                        
                        if rank and player_name:
                            ranking_data.append({
                                "순위": rank,
                                "플레이어 이름": player_name,
                                "티어": tier,
                                "LP": lp,
                                "승률": win_rate,
                                "모스트 챔피언": most_champions
                            })
                    except Exception as e:
                        logger.warning(f"Error parsing row with fallback: {e}")
                        continue
            
            if not ranking_data:
                return {"error": f"No valid data extracted from page {page} with fallback method"}
            
            logger.info(f"Fallback method successfully crawled {len(ranking_data)} records from page {page}")
            return {
                "success": True,
                "data": ranking_data,
                "total_records": len(ranking_data),
                "region": region,
                "page": page,
                "rank_range": f"{rank_start}-{rank_start + 49}",
                "url_used": url,
                "method": "requests_fallback"
            }
            
        except Exception as e:
            logger.error(f"Fallback method failed for page {page}: {type(e).__name__}: {str(e)}")
            return {"error": f"Fallback method failed for page {page}: {type(e).__name__}: {str(e)}"}

    def crawl_multiple_pages_with_progress(self, region='kr', start_page=1, end_page=5):
        """Crawl multiple pages with real-time progress tracking"""
        total_pages = end_page - start_page + 1
        progress_tracker.start(total_pages)
        
        def crawl_worker():
            try:
                for page in range(start_page, end_page + 1):
                    try:
                        # Update current page BEFORE starting to crawl
                        progress_tracker.current_page = page
                        progress_tracker.emit_progress()
                        
                        logger.info(f"Starting crawl for page {page}")
                        socketio.emit('status_update', {'message': f'Crawling page {page}...', 'page': page})
                        
                        result = self.crawl_ranking_data(region=region, page=page)
                        
                        if result and result.get('success'):
                            progress_tracker.update_page(page, result.get('data', []))
                            socketio.emit('status_update', {'message': f'Page {page} completed - {len(result.get("data", []))} records', 'page': page})
                        else:
                            # Try fallback method if Selenium failed
                            error_msg = result.get('error', 'Unknown error') if result else 'No result returned'
                            logger.warning(f"Selenium failed for page {page}: {error_msg}")
                            socketio.emit('status_update', {'message': f'Page {page} Selenium failed, trying fallback...', 'page': page})
                            
                            fallback_result = self.crawl_with_requests_fallback(region=region, page=page)
                            
                            if fallback_result and fallback_result.get('success'):
                                progress_tracker.update_page(page, fallback_result.get('data', []))
                                socketio.emit('status_update', {'message': f'Page {page} completed via fallback - {len(fallback_result.get("data", []))} records', 'page': page})
                            else:
                                fallback_error = fallback_result.get('error', 'Fallback also failed') if fallback_result else 'Fallback returned no result'
                                progress_tracker.update_page(page, error=f"{error_msg} | {fallback_error}")
                                socketio.emit('status_update', {'message': f'Page {page} failed completely: {fallback_error}', 'page': page, 'error': True})
                        
                        # Delay between pages to avoid rate limiting
                        if page < end_page:
                            time.sleep(2)
                            
                    except Exception as e:
                        logger.error(f"Error crawling page {page}: {e}")
                        progress_tracker.update_page(page, error=str(e))
                        socketio.emit('status_update', {'message': f'Page {page} error: {str(e)}', 'page': page, 'error': True})
                
                progress_tracker.finish()
                socketio.emit('crawl_complete', {
                    'total_records': len(progress_tracker.all_data),
                    'total_pages': total_pages,
                    'completed_pages': progress_tracker.completed_pages,
                    'error_count': progress_tracker.error_count
                })
                
            except Exception as e:
                logger.error(f"Worker thread error: {e}")
                progress_tracker.finish()
                socketio.emit('crawl_error', {'error': str(e)})
        
        # Start crawling in background thread
        thread = threading.Thread(target=crawl_worker)
        thread.daemon = True
        thread.start()
        
        return {"message": "Crawling started", "total_pages": total_pages}

# Initialize crawler
crawler = FowCrawler()

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('connected', {'data': 'Connected to crawler'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('start_crawl')
def handle_start_crawl(data):
    region = data.get('region', 'kr')
    start_page = data.get('start_page', 1)
    end_page = data.get('end_page', 5)
    
    logger.info(f"Starting crawl: region={region}, pages={start_page}-{end_page}")
    result = crawler.crawl_multiple_pages_with_progress(region, start_page, end_page)
    emit('crawl_started', result)

@socketio.on('get_progress')
def handle_get_progress():
    progress_tracker.emit_progress()

@app.route('/')
def home():
    return jsonify({
        "message": "FOW Crawler API with Progress Tracking",
        "version": "2.0.0",
        "endpoints": {
            "/api/ranking": "GET - Crawl single page ranking data",
            "/api/ranking/multi": "POST - Crawl multiple pages with progress",
            "/api/health": "GET - Health check",
            "WebSocket Events": {
                "start_crawl": "Start multi-page crawling",
                "get_progress": "Get current progress",
                "progress_update": "Real-time progress updates",
                "status_update": "Status messages",
                "crawl_complete": "Crawling finished",
                "crawl_error": "Crawling error"
            }
        }
    })

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()})

@app.route('/api/ranking')
def get_ranking():
    """Get ranking data from FOW.LOL"""
    try:
        region = request.args.get('region', 'kr')
        page = int(request.args.get('page', 1))
        method = request.args.get('method', 'selenium')  # 'selenium' or 'requests'
        
        logger.info(f"Fetching ranking data - Region: {region}, Page: {page}, Method: {method}")
        
        if method == 'requests':
            result = crawler.crawl_with_requests_fallback(region, page)
        else:
            result = crawler.crawl_ranking_data(region, page)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ranking/multi', methods=['POST'])
def start_multi_page_crawl():
    """Start multi-page crawling with progress tracking"""
    try:
        data = request.get_json() or {}
        region = data.get('region', 'kr')
        start_page = data.get('start_page', 1)
        end_page = data.get('end_page', 5)
        
        result = crawler.crawl_multiple_pages_with_progress(region, start_page, end_page)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Multi-page crawl error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/progress')
def get_current_progress():
    """Get current crawling progress"""
    eta_seconds = progress_tracker.get_eta()
    eta_formatted = None
    if eta_seconds:
        eta_time = datetime.now() + timedelta(seconds=eta_seconds)
        eta_formatted = eta_time.strftime("%H:%M:%S")
    
    elapsed_seconds = 0
    if progress_tracker.start_time:
        elapsed_seconds = (datetime.now() - progress_tracker.start_time).total_seconds()
    
    return jsonify({
        'total_pages': progress_tracker.total_pages,
        'completed_pages': progress_tracker.completed_pages,
        'current_page': progress_tracker.current_page,
        'remaining_pages': progress_tracker.total_pages - progress_tracker.completed_pages,
        'progress_percent': (progress_tracker.completed_pages / progress_tracker.total_pages * 100) if progress_tracker.total_pages > 0 else 0,
        'eta_seconds': eta_seconds,
        'eta_formatted': eta_formatted,
        'elapsed_seconds': elapsed_seconds,
        'is_running': progress_tracker.is_running,
        'error_count': progress_tracker.error_count,
        'total_records': len(progress_tracker.all_data),
        'all_data': progress_tracker.all_data  # Return all data instead of subset
    })

@app.route('/api/ranking/export')
def export_ranking():
    """Export ranking data as CSV"""
    try:
        region = request.args.get('region', 'kr')
        page = int(request.args.get('page', 1))
        
        crawler = FowCrawler()
        data = crawler.crawl_ranking_data(region=region, page=page)
        
        if not data:
            return jsonify({'error': 'No data found'}), 404
        
        # Create CSV
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=['순위', '플레이어 이름', '티어', 'LP', '승률', '모스트 챔피언'])
        writer.writeheader()
        writer.writerows(data['data'])
        
        # Create response
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=fow_ranking_{region}_page{page}.csv'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search/winrate')
def search_by_winrate():
    """Search for players with specific winning percentage or return all players"""
    try:
        region = request.args.get('region', 'kr')
        target_winrate = request.args.get('winrate', '0')
        start_page = int(request.args.get('start_page', 1))
        end_page = int(request.args.get('end_page', 5))
        
        # Fallback to max_pages for backward compatibility
        if 'max_pages' in request.args:
            max_pages = int(request.args.get('max_pages', 5))
            start_page = 1
            end_page = max_pages
        
        # Clean the target winrate (remove % if present)
        target_winrate = target_winrate.replace('%', '').strip()
        
        # Default to 0 if empty
        if not target_winrate:
            target_winrate = '0'
        
        try:
            target_winrate_float = float(target_winrate)
        except ValueError:
            return jsonify({'error': 'Invalid winning percentage format'}), 400
        
        crawler = FowCrawler()
        matching_players = []
        
        # Determine if we're filtering by winrate or returning all players
        filter_by_winrate = target_winrate_float > 0
        
        # Search through specified page range
        for page in range(start_page, end_page + 1):
            try:
                print(f"Searching page {page} for region {region}...")
                result = crawler.crawl_ranking_data(region=region, page=page)
                
                # If Selenium fails, try the requests method as fallback
                if not result or not result.get('success'):
                    print(f"Selenium failed for page {page}, trying requests method...")
                    result = crawler.crawl_with_requests_fallback(region=region, page=page)
                
                if not result:
                    print(f"No result returned for page {page}")
                    break
                    
                if not result.get('success'):
                    print(f"Page {page} failed: {result.get('error', 'Unknown error')}")
                    continue
                    
                data = result.get('data', [])
                if not data:
                    print(f"No data found on page {page}")
                    break
                
                print(f"Page {page}: Found {len(data)} players")
                
                # Add all players or filter by winrate
                page_matches = 0
                for player in data:
                    player['페이지'] = page  # Add page info
                    
                    if not filter_by_winrate:
                        # Return all players when target_winrate is 0
                        matching_players.append(player)
                        page_matches += 1
                    else:
                        # Filter by winrate when target_winrate > 0
                        winrate_raw = player.get('승률', '')
                        
                        try:
                            # Handle Korean format: "230승 146패 (61.17%)"
                            winrate_str = winrate_raw
                            
                            # Extract percentage from parentheses if present
                            if '(' in winrate_str and ')' in winrate_str:
                                # Get the part inside parentheses
                                start = winrate_str.find('(')
                                end = winrate_str.find(')', start)
                                winrate_str = winrate_str[start+1:end]
                            
                            # Remove % symbol and clean
                            winrate_str = winrate_str.replace('%', '').strip()
                            
                            # Convert to float
                            player_winrate = float(winrate_str)
                            
                            # Match players with target winrate or higher
                            if player_winrate >= target_winrate_float:
                                matching_players.append(player)
                                page_matches += 1
                                
                        except (ValueError, TypeError, AttributeError):
                            # Skip players with unparseable winrate data when filtering
                            continue
                
                if filter_by_winrate:
                    print(f"Page {page}: Found {page_matches} matches with winrate >= {target_winrate_float}%")
                else:
                    print(f"Page {page}: Added all {page_matches} players")
                
                # Add a longer delay between pages to avoid rate limiting
                if page < end_page:
                    import time
                    time.sleep(3)  # Increased from 1 to 3 seconds
                        
            except Exception as e:
                print(f"Error searching page {page}: {e}")
                continue
        
        search_type = "all players" if not filter_by_winrate else f"players with winrate >= {target_winrate}%"
        total_pages = end_page - start_page + 1
        
        return jsonify({
            'success': True,
            'data': matching_players,
            'total_found': len(matching_players),
            'search_type': search_type,
            'target_winrate': f"{target_winrate}%" if filter_by_winrate else "0% (all players)",
            'region': region,
            'start_page': start_page,
            'end_page': end_page,
            'pages_searched': total_pages
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True) 