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

const App: React.FC = () => {
  // Search state
  const [searchResults, setSearchResults] = useState<RankingData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Check server status
  useEffect(() => {
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
    
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Server Online';
      case 'offline': return 'Server Offline';
      case 'checking': return 'Checking Server...';
      default: return 'Unknown Status';
    }
  };

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
            />
          </SearchSection>
          
          <ResultSection>
            <ResultComponent 
              data={searchResults}
              isLoading={isSearching}
            />
          </ResultSection>
        </MainContent>
      </Container>
    </AppContainer>
  );
};

export default App;