import React from 'react';
import styled from 'styled-components';
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

interface ResultComponentProps {
  data: RankingData[];
  isLoading?: boolean;
  region?: string;
}

// Helper function to generate FOW.LOL profile link
const generateProfileLink = (playerName: string, region: string = 'kr'): string => {
  // Parse player name to extract ID and tag
  // Format: "PlayerName#TAG" or just "PlayerName"
  let id = playerName;
  let tag = '';
  
  if (playerName.includes('#')) {
    const parts = playerName.split('#');
    id = parts[0];
    tag = parts[1] || '';
  }
  
  // Replace spaces with + in ID
  const formattedId = id.replace(/\s+/g, '+');
  
  // Generate link: https://www.fow.lol/find/{region}/{id}-{tag}
  const baseUrl = 'https://www.fow.lol/find';
  if (tag) {
    return `${baseUrl}/${region.toLowerCase()}/${formattedId}-${tag}`;
  } else {
    return `${baseUrl}/${region.toLowerCase()}/${formattedId}`;
  }
};

// Helper function to open player profile in sized window
const openPlayerProfile = (playerName: string, region: string = 'kr') => {
  const url = generateProfileLink(playerName, region);
  const windowFeatures = 'width=1040,height=800,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=no';
  window.open(url, '_blank', windowFeatures);
};

// Styled Components
const ResultContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  
  /* Mobile: Use consistent height for all states */
  @media (max-width: 768px) {
    height: auto;
    min-height: 400px;
    max-height: 500px;
    display: flex;
    flex-direction: column;
  }
`;

const ResultHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  height: 80px;
  
  /* Smaller desktop: Slightly reduce padding and height */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 18px;
    height: 75px;
  }
  
  /* Mobile: Reduce padding and height */
  @media (max-width: 768px) {
    padding: 15px;
    height: 60px;
  }
`;

const ResultTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 17px;
  }
  
  /* Mobile: Smaller title */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ResultCount = styled.p`
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 13.5px;
    margin: 4px 0 0 0;
  }
  
  /* Mobile: Smaller text */
  @media (max-width: 768px) {
    font-size: 13px;
    margin: 3px 0 0 0;
  }
`;

const TableContainer = styled.div`
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 0;
  
  /* Smaller desktop: Slightly adjust max height */
  @media (max-width: 1500px), (max-height: 880px) {
    max-height: calc(100vh - 180px);
  }
  
  /* Mobile: Use consistent height with other states */
  @media (max-width: 768px) {
    flex: 1;
    max-height: 440px;
    overflow-x: auto;
    overflow-y: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 12.5px;
  }
  
  /* Mobile: Smaller font and minimum width */
  @media (max-width: 768px) {
    font-size: 12px;
    min-width: 800px; /* Ensure table doesn't get too cramped */
  }
`;

const TableHeader = styled.th`
  background-color: #34495e;
  color: white;
  padding: 12px 8px;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: bold;
  font-size: 12px;
  border-right: 1px solid #2c3e50;

  &:last-child {
    border-right: none;
  }
  
  /* Smaller desktop: Slightly reduce padding and font size */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 10px 7px;
    font-size: 11.5px;
  }
  
  /* Mobile: Reduce padding */
  @media (max-width: 768px) {
    padding: 8px 6px;
    font-size: 11px;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }

  &:hover {
    background-color: #e3f2fd;
  }
`;

const TableCell = styled.td`
  padding: 10px 8px;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  vertical-align: middle;

  &:last-child {
    border-right: none;
  }
  
  /* Smaller desktop: Slightly reduce padding */
  @media (max-width: 1500px), (max-height: 880px) {
    padding: 9px 7px;
  }
  
  /* Mobile: Reduce padding */
  @media (max-width: 768px) {
    padding: 8px 6px;
  }
`;

const RankCell = styled(TableCell)`
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  width: 60px;
`;

const PlayerNameCell = styled(TableCell)`
  font-weight: 600;
  color: #3498db;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  /* Smaller desktop: Slightly reduce max width */
  @media (max-width: 1500px), (max-height: 880px) {
    max-width: 135px;
  }
  
  /* Mobile: Adjust max width */
  @media (max-width: 768px) {
    max-width: 120px;
  }
`;

const PlayerLink = styled.span`
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #2980b9;
    text-decoration: underline;
  }
`;

const TierCell = styled(TableCell)`
  font-weight: 500;
  color: #8e44ad;
`;

const LPCell = styled(TableCell)`
  text-align: right;
  font-weight: 500;
  color: #27ae60;
`;

const WinrateCell = styled(TableCell)`
  text-align: center;
  font-weight: 500;
  color: #e74c3c;
`;

const ChampionCell = styled(TableCell)`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  /* Smaller desktop: Slightly reduce max width */
  @media (max-width: 1500px), (max-height: 880px) {
    max-width: 110px;
  }
  
  /* Mobile: Adjust max width */
  @media (max-width: 768px) {
    max-width: 100px;
  }
`;

const PageCell = styled(TableCell)`
  text-align: center;
  color: #666;
  font-size: 11px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
  text-align: center;
  
  /* Smaller desktop: Slightly reduce height */
  @media (max-width: 1500px), (max-height: 880px) {
    height: 250px;
  }
  
  /* Mobile: Use consistent height with other states */
  @media (max-width: 768px) {
    flex: 1;
    height: auto;
    min-height: 340px;
    padding: 20px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
  
  /* Smaller desktop: Slightly reduce icon size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 42px;
    margin-bottom: 14px;
  }
  
  /* Mobile: Smaller icon */
  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 12px;
  }
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin: 0;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 15px;
  }
  
  /* Mobile: Smaller text */
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  margin: 8px 0 0 0;
  opacity: 0.7;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 13px;
    margin: 7px 0 0 0;
  }
  
  /* Mobile: Smaller text */
  @media (max-width: 768px) {
    font-size: 12px;
    margin: 6px 0 0 0;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 80px);
  color: #666;
  
  /* Smaller desktop: Adjust height for smaller header */
  @media (max-width: 1500px), (max-height: 880px) {
    height: calc(100% - 75px);
  }
  
  /* Mobile: Use consistent height with other states */
  @media (max-width: 768px) {
    flex: 1;
    height: auto;
    min-height: 340px;
    padding: 20px;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Mobile: Slightly larger spinner for better visibility */
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    border-width: 5px;
    margin-bottom: 20px;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  margin: 0;
  text-align: center;
  
  /* Smaller desktop: Slightly reduce font size */
  @media (max-width: 1500px), (max-height: 880px) {
    font-size: 15px;
  }
  
  /* Mobile: Adjust font size and add padding */
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 0 10px;
  }
`;

const ResultComponent: React.FC<ResultComponentProps> = ({ data, isLoading = false, region }) => {
  const { t, tn } = useLocale();

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>{t('loadingSearchResults')}</LoadingText>
        </LoadingState>
      );
    }

    if (data.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyText>{t('noSearchResultsYet')}</EmptyText>
          <EmptySubtext>{t('useSearchPanel')}</EmptySubtext>
        </EmptyState>
      );
    }

    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeader>{t('rank')}</TableHeader>
              <TableHeader>{t('playerName')}</TableHeader>
              <TableHeader>{t('tier')}</TableHeader>
              <TableHeader>{t('lp')}</TableHeader>
              <TableHeader>{t('winrate')}</TableHeader>
              <TableHeader>{t('mostChampion')}</TableHeader>
              <TableHeader>{t('page')}</TableHeader>
            </tr>
          </thead>
          <tbody>
            {data.map((player, index) => (
              <TableRow key={index}>
                <RankCell>{player.순위}</RankCell>
                <PlayerNameCell title={player['플레이어 이름']}>
                  <PlayerLink onClick={() => openPlayerProfile(player['플레이어 이름'], region)}>
                    {player['플레이어 이름']}
                  </PlayerLink>
                </PlayerNameCell>
                <TierCell>{player.티어}</TierCell>
                <LPCell>{player.LP}</LPCell>
                <WinrateCell>{player.승률}</WinrateCell>
                <ChampionCell title={player['모스트 챔피언']}>
                  {player['모스트 챔피언']}
                </ChampionCell>
                <PageCell>{player.페이지}</PageCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <ResultContainer>
      <ResultHeader>
        <ResultTitle>{t('searchResults')}</ResultTitle>
        <ResultCount>
          {isLoading 
            ? t('searching') 
            : data.length === 0 
              ? t('noResultsToDisplay') 
              : `${data.length} ${t('playersFound')}`
          }
        </ResultCount>
      </ResultHeader>
      {renderTableContent()}
    </ResultContainer>
  );
};

export default ResultComponent; 