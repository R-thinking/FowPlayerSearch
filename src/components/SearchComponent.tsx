import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLocale } from '../locales/LocaleContext';

interface RankingData {
  순위: string;
  '플레이어 이름': string;
  티어: string;
  LP: string;
  승률: string;
  '모스트 챔피언': string;
  페이지?: number;
}

interface SearchComponentProps {
  onSearchResults: (data: RankingData[]) => void;
  onError: (error: string) => void;
  onSearchStart?: () => void;
  onSearchStop?: () => void;
  onRegionChange?: (region: string) => void;
}

// Styled Components
const SearchContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  
  /* Smaller desktop: Slightly reduce padding */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 18px;
  }
  
  /* Mobile: Reduce padding */
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const SearchModeToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
  
  /* Smaller desktop: Slightly reduce margin */
  @media (max-width: 1500px), (max-height: 880px) {
    margin-bottom: 18px;
    gap: 9px;
  }
  
  /* Mobile: Reduce margin and gap */
  @media (max-width: 768px) {
    margin-bottom: 15px;
    gap: 8px;
  }
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 2px solid #3498db;
  border-radius: 20px;
  background-color: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#3498db'};
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#ecf0f1'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Smaller desktop: Slightly reduce padding */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 7px 14px;
    font-size: 11.5px;
  }
  
  /* Mobile: Smaller buttons */
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const SearchGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  
  /* Smaller desktop: Slightly reduce gaps */
  @media (max-width: 1500px), (max-height: 880px) {
    gap: 13px;
    margin-bottom: 18px;
  }
  
  /* Mobile: Reduce gaps */
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 15px;
  }
`;

const InputGroup = styled.div`
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 14px;
  }
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    label {
      font-size: 13.5px;
      margin-bottom: 4px;
    }
  }
  
  /* Mobile: Smaller labels */
  @media (max-width: 768px) {
    label {
      font-size: 13px;
      margin-bottom: 4px;
    }
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 7px;
    font-size: 13.5px;
  }
  
  /* Mobile: Smaller inputs */
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 13px;
  }
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 7px;
    font-size: 13.5px;
  }
  
  /* Mobile: Smaller selects */
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 13px;
  }
`;

const RangeInputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  
  /* Smaller desktop: Slightly reduce gaps and margins */
  @media (max-width: 1500px), (max-height: 880px) {
    gap: 9px;
    margin-bottom: 18px;
  }
  
  /* Mobile: Reduce gaps and margins */
  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 15px;
  }
`;

const PrimaryButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background-color: #3498db;
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #2980b9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 11px 18px;
    font-size: 13.5px;
  }
  
  /* Mobile: Smaller buttons */
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const StopButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background-color: #e74c3c;
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #c0392b;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 11px 18px;
    font-size: 13.5px;
  }
  
  /* Mobile: Smaller buttons */
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const SuccessButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  background-color: #27ae60;
  color: white;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #219a52;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 9px 18px;
    font-size: 13.5px;
  }
  
  /* Mobile: Smaller buttons */
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const Note = styled.div`
  margin-bottom: 15px;
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
`;

const InfoBox = styled.div`
  background-color: #e8f4fd;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #0c5460;
  line-height: 1.4;
`;

const ProgressContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ProgressText = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
`;

const pulse = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    animation: ${pulse} 1.5s ease-in-out infinite;
    display: ${props => props.progress < 100 ? 'block' : 'none'};
  }
`;

const LoadingCircle = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 10px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressInfoContainer = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 13px;
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 13px;
    margin-bottom: 18px;
    font-size: 12.5px;
  }
  
  /* Mobile: Reduce padding and font size */
  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 15px;
    font-size: 12px;
  }
`;

const ProgressInfoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #2c3e50;
  font-weight: bold;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 13.5px;
    margin-bottom: 11px;
  }
  
  /* Mobile: Smaller title */
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 10px;
  }
`;

const ProgressInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
  
  /* Smaller desktop: Slightly reduce gap */
  @media (max-width: 1500px), (max-height: 880px) {
    gap: 9px;
    margin-bottom: 11px;
  }
  
  /* Mobile: Single column layout */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const ProgressInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
`;

const ProgressInfoLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const ProgressInfoValue = styled.span<{ status?: 'active' | 'success' | 'error' | 'waiting' }>`
  font-weight: bold;
  color: ${props => {
    switch (props.status) {
      case 'active': return '#3498db';
      case 'success': return '#27ae60';
      case 'error': return '#e74c3c';
      case 'waiting': return '#f39c12';
      default: return '#2c3e50';
    }
  }};
`;

const ApiStateIndicator = styled.div<{ state: 'idle' | 'connecting' | 'fetching' | 'processing' | 'complete' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  background-color: ${props => {
    switch (props.state) {
      case 'idle': return '#e9ecef';
      case 'connecting': return '#fff3cd';
      case 'fetching': return '#cce5ff';
      case 'processing': return '#d4edda';
      case 'complete': return '#d1ecf1';
      case 'error': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.state) {
      case 'idle': return '#6c757d';
      case 'connecting': return '#856404';
      case 'fetching': return '#004085';
      case 'processing': return '#155724';
      case 'complete': return '#0c5460';
      case 'error': return '#721c24';
      default: return '#6c757d';
    }
  }};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
    ${props => (props.state === 'fetching' || props.state === 'processing') && `
      animation: pulse 1.5s ease-in-out infinite;
    `}
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const HelpText = styled.div`
  font-size: 11px;
  color: #6c757d;
  line-height: 1.4;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
`;

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearchResults, onError, onSearchStart, onSearchStop, onRegionChange }) => {
  const { t, tn } = useLocale();
  
  // Search mode
  const [searchMode, setSearchMode] = useState<'page' | 'rank'>('page');
  
  // Search configuration
  const [region, setRegion] = useState<string>('kr');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(5);
  const [startRank, setStartRank] = useState<number>(1);
  const [endRank, setEndRank] = useState<number>(50);
  
  // Search state
  const [searchData, setSearchData] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetWinrate, setTargetWinrate] = useState<string>('0');

  // Progress tracking state
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [recordsFound, setRecordsFound] = useState<number>(0);
  const [searchDuration, setSearchDuration] = useState<number>(0);
  const [liveDuration, setLiveDuration] = useState<number>(0);
  const [averageTimePerCompletedPage, setAverageTimePerCompletedPage] = useState<number>(0);
  const [apiState, setApiState] = useState<'idle' | 'connecting' | 'fetching' | 'processing' | 'complete' | 'error'>('idle');

  // Add state for tracking search start time
  const [searchStartTime, setSearchStartTime] = useState<number>(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Progress polling for large range searches
  const [progressPollingInterval, setProgressPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Progress polling function
  const pollProgress = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/progress');
      if (response.ok) {
        const progressData = await response.json();
        if (progressData.is_running) {
          setCurrentPage(progressData.current_page);
          setRecordsFound(progressData.total_records);
          // You could also update other progress indicators here
        }
      }
    } catch (error) {
      // Silently handle polling errors to avoid spam
      console.log('Progress polling error:', error);
    }
  };

  // Start progress polling
  const startProgressPolling = () => {
    if (progressPollingInterval) {
      clearInterval(progressPollingInterval);
    }
    const interval = setInterval(pollProgress, 1000); // Poll every second
    setProgressPollingInterval(interval);
  };

  // Stop progress polling
  const stopProgressPolling = () => {
    if (progressPollingInterval) {
      clearInterval(progressPollingInterval);
      setProgressPollingInterval(null);
    }
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      stopProgressPolling();
    };
  }, []);

  // Live duration timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isLoading && searchStartTime > 0) {
      intervalId = setInterval(() => {
        const elapsed = Math.round((Date.now() - searchStartTime) / 1000);
        setLiveDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, searchStartTime]);

  const regions = [
    { value: 'kr', label: tn('regions.kr') },
    { value: 'na', label: tn('regions.na') },
    { value: 'euw', label: tn('regions.euw') },
    { value: 'eun', label: tn('regions.eun') },
    { value: 'jp', label: tn('regions.jp') },
    { value: 'oce', label: tn('regions.oce') }
  ];

  // Helper function to calculate pages from rank range
  const calculatePagesFromRanks = (startRank: number, endRank: number) => {
    const startPage = Math.ceil(startRank / 50);
    const endPage = Math.ceil(endRank / 50);
    return { startPage, endPage };
  };

  // Helper function to filter results by rank range
  const filterByRankRange = (data: RankingData[], startRank: number, endRank: number) => {
    return data.filter(player => {
      const rank = parseInt(player.순위);
      return rank >= startRank && rank <= endRank;
    });
  };

  const searchByWinrate = async () => {
    let actualStartPage: number;
    let actualEndPage: number;

    if (searchMode === 'rank') {
      if (startRank > endRank) {
        onError(t('startRankError'));
        return;
      }
      if (startRank < 1 || endRank < 1) {
        onError(t('rankGreaterThanZero'));
        return;
      }
      const pages = calculatePagesFromRanks(startRank, endRank);
      actualStartPage = pages.startPage;
      actualEndPage = pages.endPage;
    } else {
      if (startPage > endPage) {
        onError(t('startPageError'));
        return;
      }
      actualStartPage = startPage;
      actualEndPage = endPage;
    }

    // Initialize progress tracking
    setTotalPages(actualEndPage - actualStartPage + 1);
    setCurrentPage(0);
    setRecordsFound(0);
    setApiState('connecting');
    
    // Reset all timing variables
    const startTime = Date.now();
    setSearchStartTime(startTime);
    setSearchDuration(0);
    setLiveDuration(0);

    // Create abort controller for this search
    const controller = new AbortController();
    setAbortController(controller);

    setIsLoading(true);
    onSearchStart?.(); // Notify parent that search is starting
    onError(''); // Clear previous errors
    
    try {
      setApiState('fetching');
      
      // NEW OPTIMIZED APPROACH:
      // For small ranges (1-3 pages): Show incremental results per page
      // For larger ranges (4+ pages): Use bulk processing
      
      const totalPagesCount = actualEndPage - actualStartPage + 1;
      
      if (totalPagesCount <= 3) {
        // INCREMENTAL PROCESSING for small ranges (1-3 pages)
        let allProcessedData: RankingData[] = [];
        
        for (let page = actualStartPage; page <= actualEndPage; page++) {
          // Check if search was cancelled
          if (controller.signal.aborted) {
            throw new Error('Search cancelled by user');
          }

          // Set current page being processed
          setCurrentPage(page);
          setApiState('fetching');
          
          // Fetch individual page without filtering for speed
          const response = await fetch(
            `http://localhost:5002/api/search/winrate?region=${region}&winrate=0&start_page=${page}&end_page=${page}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (!response.ok) {
            setApiState('error');
            throw new Error(`HTTP error! status: ${response.status} on page ${page}`);
          }
          
          setApiState('processing');
          const result = await response.json();
          
          if (result.success && result.data) {
            // Add new data to accumulated results
            allProcessedData = [...allProcessedData, ...result.data];
            
            // Apply frontend filtering
            let filteredData = allProcessedData;
            
            // Apply winrate filtering if needed
            const targetWinrateFloat = parseFloat(targetWinrate || '0');
            if (targetWinrateFloat > 0) {
              filteredData = allProcessedData.filter(player => {
                const winrateRaw = player.승률 || '';
                try {
                  let winrateStr = winrateRaw;
                  if (winrateStr.includes('(') && winrateStr.includes(')')) {
                    const start = winrateStr.indexOf('(');
                    const end = winrateStr.indexOf(')', start);
                    winrateStr = winrateStr.substring(start + 1, end);
                  }
                  winrateStr = winrateStr.replace('%', '').trim();
                  const playerWinrate = parseFloat(winrateStr);
                  return !isNaN(playerWinrate) && playerWinrate >= targetWinrateFloat;
                } catch {
                  return false;
                }
              });
            }
            
            // Apply rank range filtering if needed
            if (searchMode === 'rank') {
              filteredData = filterByRankRange(filteredData, startRank, endRank);
            }
            
            // Update results incrementally after each page
            setRecordsFound(filteredData.length);
            setSearchData(filteredData);
            onSearchResults(filteredData);
            
            // Update average time per completed page (stable average)
            const completedCount = page - actualStartPage + 1;
            const currentElapsed = Math.round((Date.now() - startTime) / 1000);
            setAverageTimePerCompletedPage(currentElapsed / completedCount);
          } else {
            setApiState('error');
            onError(result.error || `Failed to search data on page ${page}`);
            return;
          }
        }
        
      } else {
        // BULK PROCESSING for larger ranges (4+ pages)
        setApiState('fetching');
        setCurrentPage(actualStartPage);
        
        // Start progress polling for real-time updates
        startProgressPolling();
        
        const response = await fetch(
          `http://localhost:5002/api/search/winrate?region=${region}&winrate=0&start_page=${actualStartPage}&end_page=${actualEndPage}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          stopProgressPolling();
          setApiState('error');
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get all raw data
        setApiState('processing');
        
        const result = await response.json();
        
        // Stop progress polling once we get the result
        stopProgressPolling();
        
        if (!result.success || !result.data) {
          setApiState('error');
          onError(result.error || 'Failed to fetch data');
          return;
        }
        
        let allRawData: RankingData[] = result.data;
        
        // Process filtering on frontend
        setApiState('processing');
        
        let filteredData = allRawData;
        
        // Apply winrate filtering if needed
        const targetWinrateFloat = parseFloat(targetWinrate || '0');
        if (targetWinrateFloat > 0) {
          filteredData = allRawData.filter(player => {
            const winrateRaw = player.승률 || '';
            try {
              let winrateStr = winrateRaw;
              if (winrateStr.includes('(') && winrateStr.includes(')')) {
                const start = winrateStr.indexOf('(');
                const end = winrateStr.indexOf(')', start);
                winrateStr = winrateStr.substring(start + 1, end);
              }
              winrateStr = winrateStr.replace('%', '').trim();
              const playerWinrate = parseFloat(winrateStr);
              return !isNaN(playerWinrate) && playerWinrate >= targetWinrateFloat;
            } catch {
              return false;
            }
          });
        }
        
        // Apply rank range filtering if needed
        if (searchMode === 'rank') {
          filteredData = filterByRankRange(filteredData, startRank, endRank);
        }
        
        // Update final results
        setRecordsFound(filteredData.length);
        setSearchData(filteredData);
        onSearchResults(filteredData);
      }
      
      // Update progress to show completion
      setCurrentPage(actualEndPage);
      const finalDuration = Date.now() - startTime;
      const finalDurationSeconds = Math.round(finalDuration / 1000);
      console.log('Search completed - Duration:', finalDuration, 'ms =', finalDurationSeconds, 's');
      setSearchDuration(finalDuration);
      setLiveDuration(finalDurationSeconds);
      setApiState('complete');
      
    } catch (err) {
      // Stop progress polling in case of error
      stopProgressPolling();
      
      const finalDuration = Date.now() - startTime;
      const finalDurationSeconds = Math.round(finalDuration / 1000);
      console.log('Search error/cancelled - Duration:', finalDuration, 'ms =', finalDurationSeconds, 's');
      setSearchDuration(finalDuration);
      setLiveDuration(finalDurationSeconds);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setApiState('idle');
        onError('Search cancelled');
      } else {
        setApiState('error');
        onError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      // Ensure progress polling is stopped
      stopProgressPolling();
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const stopSearch = () => {
    if (abortController && searchStartTime > 0) {
      // Stop progress polling
      stopProgressPolling();
      
      const finalDuration = Date.now() - searchStartTime;
      const finalDurationSeconds = Math.round(finalDuration / 1000);
      console.log('Search manually stopped - Duration:', finalDuration, 'ms =', finalDurationSeconds, 's');
      setSearchDuration(finalDuration);
      setLiveDuration(finalDurationSeconds);
      
      abortController.abort();
      setIsLoading(false);
      setApiState('idle');
      setAbortController(null);
      onSearchStop?.(); // Notify parent that search was stopped
    }
  };

  const exportSearchDataToCsv = () => {
    if (searchData.length === 0) {
      onError('No data to export');
      return;
    }

    const searchInfo = searchMode === 'rank' ? `ranks${startRank}-${endRank}` : `pages${startPage}-${endPage}`;
    const csvContent = [
      ['순위', '플레이어 이름', '티어', 'LP', '승률', '모스트 챔피언', '페이지'].join(','),
      ...searchData.map(row => [
        row.순위,
        row['플레이어 이름'],
        row.티어,
        row.LP,
        row.승률,
        row['모스트 챔피언'],
        row.페이지 || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fow_search_results_${region}_winrate${targetWinrate}_${searchInfo}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getSearchDescription = () => {
    if (searchMode === 'rank') {
      const pages = calculatePagesFromRanks(startRank, endRank);
      return `Searching ranks ${startRank}-${endRank} (pages ${pages.startPage}-${pages.endPage})`;
    } else {
      return `Searching pages ${startPage}-${endPage} (ranks ${(startPage-1)*50+1}-${endPage*50})`;
    }
  };

  const getApiStateText = () => {
    switch (apiState) {
      case 'idle': return t('apiReadyStatus');
      case 'connecting': return t('connecting');
      case 'fetching': return t('fetchingData');
      case 'processing': return t('processing');
      case 'complete': return t('complete');
      case 'error': return t('apiError');
      default: return t('connecting');
    }
  };

  const getProgressPercentage = () => {
    if (totalPages === 0) return 0;
    if (apiState === 'complete') return 100;
    if (currentPage === 0) return 0;
    
    // Calculate progress based on current page
    const progressPercentage = Math.round((currentPage / totalPages) * 100);
    
    // Ensure we don't show 100% unless actually complete
    return Math.min(progressPercentage, 99);
  };

  return (
    <SearchContainer>
      <SearchModeToggle>
        <ToggleButton 
          active={searchMode === 'page'} 
          onClick={() => setSearchMode('page')}
          disabled={isLoading}
        >
          {t('searchByPages')}
        </ToggleButton>
        <ToggleButton 
          active={searchMode === 'rank'} 
          onClick={() => setSearchMode('rank')}
          disabled={isLoading}
        >
          {t('searchByRank')}
        </ToggleButton>
      </SearchModeToggle>
      
      <SearchGrid>
        <InputGroup>
          <label>{t('region')}</label>
          <Select 
            value={region} 
            onChange={(e) => {
              setRegion(e.target.value);
              onRegionChange?.(e.target.value);
            }}
            disabled={isLoading}
          >
            {regions.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <label>{t('targetWinrate')}</label>
          <Input
            type="text"
            value={targetWinrate}
            onChange={(e) => setTargetWinrate(e.target.value)}
            placeholder="0 = all players, or e.g., 60"
            disabled={isLoading}
          />
        </InputGroup>
        
        {searchMode === 'page' ? (
          <RangeInputGroup>
            <InputGroup>
              <label>{t('fromPage')}</label>
              <Input
                type="number"
                value={startPage}
                onChange={(e) => setStartPage(Number(e.target.value))}
                min="1"
                max="100"
                disabled={isLoading}
              />
            </InputGroup>
            
            <InputGroup>
              <label>{t('toPage')}</label>
              <Input
                type="number"
                value={endPage}
                onChange={(e) => setEndPage(Number(e.target.value))}
                min="1"
                max="100"
                disabled={isLoading}
              />
            </InputGroup>
          </RangeInputGroup>
        ) : (
          <RangeInputGroup>
            <InputGroup>
              <label>{t('fromRank')}</label>
              <Input
                type="number"
                value={startRank}
                onChange={(e) => setStartRank(Number(e.target.value))}
                min="1"
                max="5000"
                disabled={isLoading}
              />
            </InputGroup>
            
            <InputGroup>
              <label>{t('toRank')}</label>
              <Input
                type="number"
                value={endRank}
                onChange={(e) => setEndRank(Number(e.target.value))}
                min="1"
                max="5000"
                disabled={isLoading}
              />
            </InputGroup>
          </RangeInputGroup>
        )}
      </SearchGrid>

      {/* Search Progress Info */}
      <ProgressInfoContainer>
        <ProgressInfoTitle>{t('searchProgress')}</ProgressInfoTitle>
        <ProgressInfoGrid>
          <ProgressInfoItem>
            <ProgressInfoLabel>{t('pageRange')}</ProgressInfoLabel>
            <ProgressInfoValue>{totalPages > 0 ? `${totalPages} ${t('pages')}` : '-'}</ProgressInfoValue>
          </ProgressInfoItem>
          <ProgressInfoItem>
            <ProgressInfoLabel>{t('currentPage')}</ProgressInfoLabel>
            <ProgressInfoValue status={isLoading ? 'active' : 'success'}>
              {isLoading && currentPage > 0 
                ? `${currentPage} ${t('crawling')}`
                : currentPage > 0 
                  ? `${currentPage} ${t('completed')}`
                  : '-'
              }
            </ProgressInfoValue>
          </ProgressInfoItem>
          <ProgressInfoItem>
            <ProgressInfoLabel>{t('status')}</ProgressInfoLabel>
            <ApiStateIndicator state={apiState}>
              {getApiStateText()}
            </ApiStateIndicator>
          </ProgressInfoItem>
          <ProgressInfoItem>
            <ProgressInfoLabel>{t('recordsFound')}</ProgressInfoLabel>
            <ProgressInfoValue status={recordsFound > 0 ? 'success' : undefined}>
              {recordsFound}
            </ProgressInfoValue>
          </ProgressInfoItem>
          {(searchDuration > 0 || isLoading) && (
            <>
              <ProgressInfoItem>
                <ProgressInfoLabel>{t('duration')}</ProgressInfoLabel>
                <ProgressInfoValue>
                  {isLoading ? `${liveDuration}${t('seconds')}` : `${liveDuration}${t('seconds')}`}
                </ProgressInfoValue>
              </ProgressInfoItem>
              <ProgressInfoItem>
                <ProgressInfoLabel>{t('speed')}</ProgressInfoLabel>
                <ProgressInfoValue status="active">
                  {isLoading && currentPage > 0 && liveDuration > 0
                    ? (() => {
                        const actualStartPage = searchMode === 'rank' 
                          ? calculatePagesFromRanks(startRank, endRank).startPage 
                          : startPage;
                        const pagesStarted = currentPage - actualStartPage + 1;
                        const playersPerMinute = Math.round((pagesStarted * 50) / (liveDuration / 60));
                        return `${playersPerMinute} ${t('playersPerMinute')}`;
                      })()
                    : !isLoading && totalPages > 0 && searchDuration > 0
                      ? (() => {
                          const totalPlayers = totalPages * 50;
                          const playersPerMinute = Math.round(totalPlayers / (searchDuration / 1000 / 60));
                          return `${playersPerMinute} ${t('playersPerMinute')}`;
                        })()
                      : '-'
                  }
                </ProgressInfoValue>
              </ProgressInfoItem>
            </>
          )}
        </ProgressInfoGrid>
        <HelpText>
          ⚡ <strong>{t('smartProcessing')}</strong> {t('smartProcessingDesc')}
        </HelpText>
      </ProgressInfoContainer>

      {searchMode === 'rank' && (
        <InfoBox>
          <strong>{t('rankRangeInfo')}</strong> {getSearchDescription()}
          <br />
          <small>
            {t('eachPageContains')}
          </small>
        </InfoBox>
      )}

      <ButtonContainer>
        {isLoading ? (
          <StopButton onClick={stopSearch}>
            {t('stopSearch')}
          </StopButton>
        ) : (
          <PrimaryButton onClick={searchByWinrate}>
            {t('searchPlayers')}
          </PrimaryButton>
        )}
        
        {searchData.length > 0 && (
          <SuccessButton onClick={exportSearchDataToCsv}>
            {t('exportResults')} ({searchData.length} {t('records')})
          </SuccessButton>
        )}
      </ButtonContainer>

      <Note>
        <strong>{t('searchNote')}</strong> {t('searchNoteDesc')} {searchMode === 'page' ? t('pages') : t('rankRange')}. 
        {t('searchNoteDesc2')}
      </Note>

      {isLoading && (
        <ProgressContainer>
          <ProgressText>
            🔍 {getSearchDescription()} in {regions.find(r => r.value === region)?.label}...
          </ProgressText>
          <ProgressBar progress={getProgressPercentage()} />
        </ProgressContainer>
      )}
    </SearchContainer>
  );
};

export default SearchComponent;