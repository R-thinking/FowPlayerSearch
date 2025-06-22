import React from 'react';
import styled from 'styled-components';

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
}

// Styled Components
const ResultContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
`;

const ResultHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  height: 80px;
`;

const ResultTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
`;

const ResultCount = styled.p`
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
`;

const TableContainer = styled.div`
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
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
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  margin: 8px 0 0 0;
  opacity: 0.7;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 80px);
  color: #666;
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
`;

const LoadingText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const ResultComponent: React.FC<ResultComponentProps> = ({ data, isLoading = false }) => {
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Loading search results...</LoadingText>
        </LoadingState>
      );
    }

    if (data.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyText>No search results yet</EmptyText>
          <EmptySubtext>Use the search panel to find League of Legends players</EmptySubtext>
        </EmptyState>
      );
    }

    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeader>순위</TableHeader>
              <TableHeader>플레이어 이름</TableHeader>
              <TableHeader>티어</TableHeader>
              <TableHeader>LP</TableHeader>
              <TableHeader>승률</TableHeader>
              <TableHeader>모스트 챔피언</TableHeader>
              <TableHeader>페이지</TableHeader>
            </tr>
          </thead>
          <tbody>
            {data.map((player, index) => (
              <TableRow key={index}>
                <RankCell>{player.순위}</RankCell>
                <PlayerNameCell title={player['플레이어 이름']}>
                  {player['플레이어 이름']}
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
        <ResultTitle>Search Results</ResultTitle>
        <ResultCount>
          {isLoading 
            ? 'Searching...' 
            : data.length === 0 
              ? 'No results to display' 
              : `${data.length} players found`
          }
        </ResultCount>
      </ResultHeader>
      {renderTableContent()}
    </ResultContainer>
  );
};

export default ResultComponent; 