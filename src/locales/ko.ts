export const ko = {
  // App Header
  appTitle: "FOW 플레이어 검색",
  serverOnline: "서버 온라인",
  serverOffline: "서버 오프라인",
  checkingServer: "서버 확인 중...",
  
  // Startup Splash
  splashTitle: "FowCrawler",
  splashSubtitle: "리그 오브 레전드 플레이어 검색",
  initializing: "초기화 중",
  startingApiServer: "API 서버 시작 중",
  ready: "준비 완료!",
  error: "오류",
  close: "닫기",
  
  // Startup Messages
  initializingApp: "애플리케이션 초기화 중...",
  locatingExecutable: "PyInstaller 실행 파일 찾는 중...",
  startingPyInstaller: "PyInstaller API 서버 시작 중...",
  waitingForApi: "API 서버 초기화 대기 중...",
  checkingConnectivity: "API 서버가 시작되었습니다. 연결 확인 중...",
  apiReady: "API 서버가 준비되었고 응답하고 있습니다",
  
  // Search Component
  searchByPages: "페이지별 검색",
  searchByRank: "순위 범위 검색",
  region: "지역:",
  targetWinrate: "목표 승률 (%):",
  fromPage: "시작 페이지:",
  toPage: "끝 페이지:",
  fromRank: "시작 순위:",
  toRank: "끝 순위:",
  searchPlayers: "플레이어 검색",
  stopSearch: "검색 중지",
  exportResults: "결과 내보내기",
  
  // Search Progress
  searchProgress: "🔍 검색 진행 상황",
  pageRange: "페이지 범위:",
  currentPage: "현재 페이지:",
  status: "상태:",
  recordsFound: "발견된 기록:",
  duration: "소요 시간:",
  speed: "속도:",
  
  // API States
  apiReadyStatus: "준비됨",
  connecting: "연결 중...",
  fetchingData: "데이터 가져오는 중",
  processing: "처리 중",
  complete: "완료",
  apiError: "오류",
  
  // Search Info
  rankRangeInfo: "순위 범위 정보:",
  eachPageContains: "각 페이지는 50개의 순위를 포함합니다 (1페이지: 1-50위, 2페이지: 51-100위 등)",
  smartProcessing: "스마트 처리:",
  smartProcessingDesc: "작은 범위(1-3페이지)는 페이지별로 점진적 결과를 표시합니다. 큰 범위(4페이지 이상)는 최대 속도를 위해 일괄 처리를 사용합니다. 모든 필터링은 최적의 성능을 위해 프론트엔드에서 처리됩니다!",
  
  // Search Notes
  searchNote: "참고:",
  searchNoteDesc: "검색은 지정된",
  searchNoteDesc2: "높은 승률일수록 충분한 결과를 찾기 위해 더 많은 페이지를 검색해야 할 수 있습니다.",
  rankRange: "순위 범위",
  
  // Regions
  regions: {
    kr: "한국",
    na: "북미",
    euw: "유럽 서부",
    eun: "유럽 북동부",
    jp: "일본",
    oce: "오세아니아"
  },
  
  // Result Component
  searchResults: "검색 결과",
  searching: "검색 중...",
  noResultsToDisplay: "표시할 결과가 없습니다",
  playersFound: "명의 플레이어를 찾았습니다",
  loadingSearchResults: "검색 결과 로딩 중...",
  noSearchResultsYet: "검색 결과가 아직 없습니다",
  useSearchPanel: "검색 패널을 사용하여 리그 오브 레전드 플레이어를 찾으세요",
  
  // Table Headers
  rank: "순위",
  playerName: "플레이어 이름",
  tier: "티어",
  lp: "LP",
  winrate: "승률",
  mostChampion: "모스트 챔피언",
  page: "페이지",
  
  // Error Messages
  startRankError: "시작 순위는 끝 순위보다 작거나 같아야 합니다",
  rankGreaterThanZero: "순위는 0보다 커야 합니다",
  startPageError: "시작 페이지는 끝 페이지보다 작거나 같아야 합니다",
  noDataToExport: "내보낼 데이터가 없습니다",
  searchCancelled: "검색이 취소되었습니다",
  unknownError: "알 수 없는 오류가 발생했습니다",
  
  // Progress Status
  crawling: "(크롤링 중)",
  completed: "(완료)",
  
  // Units
  seconds: "초",
  pages: "페이지",
  records: "개",
  playersPerMinute: "플레이어/분",
  
  // Language
  language: "언어:",
  english: "English",
  korean: "한국어"
}; 