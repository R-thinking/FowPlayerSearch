export const en = {
  // App Header
  appTitle: "FOW Player Search",
  serverOnline: "Server Online",
  serverOffline: "Server Offline",
  checkingServer: "Checking Server...",
  
  // Startup Splash
  splashTitle: "FowCrawler",
  splashSubtitle: "League of Legends Player Search",
  initializing: "Initializing",
  startingApiServer: "Starting API Server",
  ready: "Ready!",
  error: "Error",
  close: "Close",
  
  // Startup Messages
  initializingApp: "Initializing application...",
  locatingExecutable: "Locating PyInstaller executable...",
  startingPyInstaller: "Starting PyInstaller API server...",
  waitingForApi: "Waiting for API server to initialize...",
  checkingConnectivity: "API server started, checking connectivity...",
  apiReady: "API server is ready and responding",
  
  // Search Component
  searchByPages: "Search by Pages",
  searchByRank: "Search by Rank Range",
  region: "Region:",
  targetWinrate: "Target Winrate (%):",
  fromPage: "From Page:",
  toPage: "To Page:",
  fromRank: "From Rank:",
  toRank: "To Rank:",
  searchPlayers: "Search Players",
  stopSearch: "Stop Search",
  exportResults: "Export Results",
  
  // Search Progress
  searchProgress: "🔍 Search Progress",
  pageRange: "Page Range:",
  currentPage: "Current Page:",
  status: "Status:",
  recordsFound: "Records Found:",
  duration: "Duration:",
  speed: "Speed:",
  
  // API States
  apiReadyStatus: "Ready",
  connecting: "Connecting...",
  fetchingData: "Fetching Data",
  processing: "Processing",
  complete: "Complete",
  apiError: "Error",
  
  // Search Info
  rankRangeInfo: "Rank Range Info:",
  eachPageContains: "Each page contains 50 ranks (Page 1: ranks 1-50, Page 2: ranks 51-100, etc.)",
  smartProcessing: "Smart Processing:",
  smartProcessingDesc: "Small ranges (1-3 pages) show incremental results per page. Larger ranges (4+ pages) use bulk processing for maximum speed. All filtering happens on frontend for optimal performance!",
  
  // Search Notes
  searchNote: "Note:",
  searchNoteDesc: "Enter 0 for winrate to get all players from selected",
  searchNoteDesc2: "Enter a number (e.g., 60) to filter players with winrate ≥ that percentage.",
  pages: "pages",
  rankRange: "rank range",
  
  // Regions
  regions: {
    kr: "Korea",
    na: "North America",
    euw: "Europe West",
    eun: "Europe Nordic & East",
    jp: "Japan",
    oce: "Oceania"
  },
  
  // Result Component
  searchResults: "Search Results",
  searching: "Searching...",
  noResultsToDisplay: "No results to display",
  playersFound: "players found",
  loadingSearchResults: "Loading search results...",
  noSearchResultsYet: "No search results yet",
  useSearchPanel: "Use the search panel to find League of Legends players",
  
  // Table Headers
  rank: "Rank",
  playerName: "Player Name",
  tier: "Tier",
  lp: "LP",
  winrate: "Winrate",
  mostChampion: "Most Champion",
  page: "Page",
  
  // Error Messages
  startRankError: "Start rank must be less than or equal to end rank",
  rankGreaterThanZero: "Ranks must be greater than 0",
  startPageError: "Start page must be less than or equal to end page",
  noDataToExport: "No data to export",
  searchCancelled: "Search cancelled",
  unknownError: "Unknown error occurred",
  
  // Units
  seconds: "s",
  playersPerMinute: "p/m",
  records: "records",
  
  // Language
  language: "Language:",
  english: "English",
  korean: "한국어"
}; 