import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import SearchComponent from './components/SearchComponent';
import ResultComponent from './components/ResultComponent';

interface RankingData {
  순위: string;
  '플레이어 이름': string;
  티어: string;
  LP: string;
  승률: string;
  '모스트 챔피언': string;
  페이지?: number;
}

interface StartupStatus {
  stage: 'initializing' | 'starting_api' | 'api_ready' | 'error';
  message: string;
  timestamp: number;
  apiReady: boolean;
  error: string | null;
}

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    overflow-x: hidden;
  }

  body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

// Styled Components
const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  width: 95%;
  height: 95%;
  padding: 20px;
  background-color: #f5f5f5;
`;

const MainContent = styled.div`
  display: flex;
  height: 100%;
  gap: 20px;
  align-items: flex-start;
`;

const SearchSection = styled.div`
  flex: 0 0 30%;
  min-width: 300px;
  height: calc(100% - 80px - 20px);
`;

const SearchHeader = styled.div`
  height: 80px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;

  h1 {
    margin: 0 0 5px 0;
    font-size: 24px;
  }
`;

const ServerStatus = styled.div<{ status: 'online' | 'offline' | 'checking' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  margin-top: 5px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => {
      switch (props.status) {
        case 'online': return '#27ae60';
        case 'offline': return '#e74c3c';
        case 'checking': return '#f39c12';
        default: return '#95a5a6';
      }
    }};
    ${props => props.status === 'checking' && `
      animation: pulse 1.5s ease-in-out infinite;
    `}
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const ResultSection = styled.div`
  height: 100%;
  flex: 1;
  min-width: 0;
`;

// Startup Splash Components
const SplashOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
`;

const SplashContent = styled.div`
  text-align: center;
  max-width: 500px;
  padding: 40px;
`;

const SplashTitle = styled.h1`
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #ecf0f1;
`;

const SplashSubtitle = styled.h2`
  font-size: 18px;
  margin-bottom: 40px;
  color: #bdc3c7;
  font-weight: normal;
`;

const StatusContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatusIcon = styled.div<{ stage: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: ${props => {
    switch (props.stage) {
      case 'initializing': return '#f39c12';
      case 'starting_api': return '#3498db';
      case 'api_ready': return '#27ae60';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  }};
  
  ${props => (props.stage === 'initializing' || props.stage === 'starting_api') && `
    animation: pulse 2s ease-in-out infinite;
  `}

  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
`;

const StatusMessage = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #ecf0f1;
`;

const StatusDetail = styled.div`
  font-size: 14px;
  color: #bdc3c7;
  line-height: 1.5;
`;

const ErrorDetails = styled.div`
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  font-size: 13px;
  color: #ffcccb;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 20px;
`;

const ProgressFill = styled.div<{ stage: string }>`
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 2px;
  transition: width 0.5s ease;
  width: ${props => {
    switch (props.stage) {
      case 'initializing': return '20%';
      case 'starting_api': return '60%';
      case 'api_ready': return '100%';
      case 'error': return '100%';
      default: return '0%';
    }
  }};
  
  ${props => props.stage === 'error' && `
    background: #e74c3c;
  `}
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const App: React.FC = () => {
  // Search state
  const [searchResults, setSearchResults] = useState<RankingData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [currentRegion, setCurrentRegion] = useState<string>('kr');
  
  // Startup status state
  const [startupStatus, setStartupStatus] = useState<StartupStatus | null>(null);
  const [showStartupSplash, setShowStartupSplash] = useState(true);

  // Get startup status from main process
  useEffect(() => {
    const getInitialStatus = async () => {
      try {
        // Check if we're in Electron environment
        if (window.require) {
          const { ipcRenderer } = window.require('electron');
          
          // Get initial startup status
          const status = await ipcRenderer.invoke('get-startup-status');
          setStartupStatus(status);
          
          // If API is already ready, hide splash after showing success
          if (status.apiReady) {
            setServerStatus('online');
            // Show success for longer so user can see it
            setTimeout(() => setShowStartupSplash(false), 3000);
          }
          
          // Listen for startup status updates
          const handleStatusUpdate = (event: any, status: StartupStatus) => {
            setStartupStatus(status);
            
            if (status.apiReady) {
              setServerStatus('online');
              // Show success state for 3 seconds so user can see completion
              setTimeout(() => setShowStartupSplash(false), 3000);
            } else if (status.stage === 'error') {
              setServerStatus('offline');
              // Keep splash open on error so user can see the problem
            }
          };
          
          ipcRenderer.on('startup-status-update', handleStatusUpdate);

    return () => {
            ipcRenderer.removeListener('startup-status-update', handleStatusUpdate);
          };
        } else {
          // Not in Electron, hide splash immediately
          setShowStartupSplash(false);
        }
      } catch (error) {
        console.error('Error getting startup status:', error);
        setShowStartupSplash(false);
      }
    };
    
    getInitialStatus();
  }, []);

  // Check server status (only when NOT using startup status system)
  useEffect(() => {
    // Skip health checks if we're still showing startup splash or if we have startup status from Electron
    if (showStartupSplash || startupStatus !== null) return;
    
    const checkServerStatus = async () => {
      try {
        setServerStatus('checking');
        const response = await fetch('http://localhost:5002/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    
    // Check server status every 30 seconds (only for non-Electron or fallback)
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, [showStartupSplash, startupStatus]);

  const handleSearchResults = (data: RankingData[]) => {
    setSearchResults(data);
    setIsSearching(false);
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  const handleSearchStop = () => {
    setIsSearching(false);
  };

  const handleError = (errorMessage: string) => {
    // Error handling removed - errors are handled within SearchComponent
  };

  const handleRegionChange = (region: string) => {
    setCurrentRegion(region);
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Server Online';
      case 'offline': return 'Server Offline';
      case 'checking': return 'Checking Server...';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = (stage: string) => {
    switch (stage) {
      case 'initializing': return '⚙️';
      case 'starting_api': return '🚀';
      case 'api_ready': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusTitle = (stage: string) => {
    switch (stage) {
      case 'initializing': return 'Initializing';
      case 'starting_api': return 'Starting API Server';
      case 'api_ready': return 'Ready!';
      case 'error': return 'Error';
      default: return 'Loading';
    }
  };

  const getErrorHelp = (errorCode: string | null) => {
    switch (errorCode) {
      case 'EXECUTABLE_NOT_FOUND':
        return 'The API executable could not be found. Please try reinstalling the application.';
      case 'PERMISSION_DENIED':
        return 'Permission denied when trying to start the API. Please check file permissions.';
      case 'API_TIMEOUT':
        return 'The API server took too long to start. This may be due to system performance or antivirus software.';
      case 'PROCESS_EXIT':
        return 'The API process exited unexpectedly. Please check if port 5002 is available.';
      default:
        return 'An unexpected error occurred during startup. Please try restarting the application.';
    }
  };

  // Render startup splash if needed
  if (showStartupSplash && startupStatus) {
  return (
      <AppContainer>
        <GlobalStyle />
        <SplashOverlay>
          <SplashContent>
            <SplashTitle>FowCrawler</SplashTitle>
            <SplashSubtitle>League of Legends Player Search</SplashSubtitle>
            
            <StatusContainer>
              <StatusIcon stage={startupStatus.stage}>
                {getStatusIcon(startupStatus.stage)}
              </StatusIcon>
              
              <StatusMessage>
                {getStatusTitle(startupStatus.stage)}
              </StatusMessage>
              
              <StatusDetail>
                {startupStatus.message}
              </StatusDetail>
              
              {startupStatus.stage === 'error' && startupStatus.error && (
                <ErrorDetails>
                  <strong>Error:</strong> {startupStatus.error}<br />
                  <br />
                  <strong>Solution:</strong> {getErrorHelp(startupStatus.error)}
                </ErrorDetails>
              )}
              
              <ProgressBar>
                <ProgressFill stage={startupStatus.stage} />
              </ProgressBar>
            </StatusContainer>
            
            <CloseButton onClick={() => setShowStartupSplash(false)}>
              Close
            </CloseButton>
          </SplashContent>
        </SplashOverlay>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <GlobalStyle />
      <Container>
        <MainContent>
          <SearchSection>
            <SearchHeader>
              <h1>FOW Player Search</h1>
              <ServerStatus status={serverStatus}>
                {getServerStatusText()}
              </ServerStatus>
            </SearchHeader>
            <SearchComponent 
              onSearchResults={handleSearchResults}
              onSearchStart={handleSearchStart}
              onSearchStop={handleSearchStop}
              onError={handleError}
              onRegionChange={handleRegionChange}
            />
          </SearchSection>
          
          <ResultSection>
            <ResultComponent 
              data={searchResults}
              isLoading={isSearching}
              region={currentRegion}
            />
          </ResultSection>
        </MainContent>
      </Container>
    </AppContainer>
  );
};

export default App; 