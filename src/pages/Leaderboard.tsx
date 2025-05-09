// src/pages/Leaderboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cacheService } from '../services/cacheService';
import Preloader from '../components/common/PreLoader';

// Define types for our leaderboard data
interface LeaderboardPlayer {
  name: string;
  runs?: number;
  wickets?: number;
  rank: number;
}

// Define type for summary data
interface SummaryData {
  leaderboard?: {
    runScorers?: LeaderboardPlayer[];
    wicketTakers?: LeaderboardPlayer[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define type for players data
interface PlayersData {
  stats: Array<Array<string | number>>;
  [key: string]: unknown;
}

function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runScorers, setRunScorers] = useState<LeaderboardPlayer[]>([]);
  const [wicketTakers, setWicketTakers] = useState<LeaderboardPlayer[]>([]);
  const [sortRunsBy, setSortRunsBy] = useState<string>('runs');
  const [sortWicketsBy, setSortWicketsBy] = useState<string>('wickets');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        // Fetch summary data which should contain leaderboards
        const summaryData = await cacheService.fetchSummaryData() as SummaryData;
        console.log('Summary Data:', summaryData);
        
        // Fetch players data to get additional details
        const playersData = await cacheService.fetchPlayers() as PlayersData;
        console.log('Players Data:', playersData);
        
        // Extract and process leaderboard data
        if (summaryData && summaryData.leaderboard) {
          console.log('Leaderboard Data:', summaryData.leaderboard);
          
          // Process run scorers and wicket takers
          if (summaryData.leaderboard.runScorers && 
              Array.isArray(summaryData.leaderboard.runScorers)) {
            setRunScorers(summaryData.leaderboard.runScorers);
          }
          
          if (summaryData.leaderboard.wicketTakers && 
              Array.isArray(summaryData.leaderboard.wicketTakers)) {
            setWicketTakers(summaryData.leaderboard.wicketTakers);
          }
        } else {
          // Process from players data if leaderboard is not found
          if (playersData && playersData.stats && Array.isArray(playersData.stats)) {
            console.log('Player Stats for Leaderboard:', playersData.stats);
            
            // Assuming stats is a 2D array with headers in the first row
            if (playersData.stats.length > 1) {
              const headers = playersData.stats[0];
              console.log('Headers:', headers);
              
              // Find column indices for relevant data
              const nameIndex = headers.findIndex(
                (header: string | number) => typeof header === 'string' && 
                  (header === 'Name' || header === 'Player Name' || header.includes('Name'))
              );
              
              // Find runs column - try different possible names
              let runsIndex = headers.findIndex(
                (header: string | number) => typeof header === 'string' && 
                  (header === 'Runs' || header === 'Runs Scored' || header === 'Total Runs')
              );
              
              // If not found by common names, try to find by looking at column values
              if (runsIndex === -1) {
                // Try to find by looking for numeric columns with large values
                for (let i = 0; i < headers.length; i++) {
                  const headerStr = String(headers[i]).toLowerCase();
                  if (i !== nameIndex && 
                      (headerStr.includes('run') || headerStr.includes('score'))) {
                    runsIndex = i;
                    break;
                  }
                }
              }
              
              // Find wickets column - try different possible names
              let wicketsIndex = headers.findIndex(
                (header: string | number) => typeof header === 'string' && 
                  (header === 'Wickets' || header === 'Wickets Taken' || header === 'Total Wickets')
              );
              
              // If not found by common names, try to find by looking at column values
              if (wicketsIndex === -1) {
                // Try to find by looking for columns with "wicket" in the name
                for (let i = 0; i < headers.length; i++) {
                  const headerStr = String(headers[i]).toLowerCase();
                  if (i !== nameIndex && headerStr.includes('wicket')) {
                    wicketsIndex = i;
                    break;
                  }
                }
              }
              
              console.log(`Indices - Name: ${nameIndex}, Runs: ${runsIndex}, Wickets: ${wicketsIndex}`);
              
              // Extract and sort players by runs and wickets
              if (nameIndex !== -1) {
                const playerData = playersData.stats.slice(1); // Skip header row
                
                // Process run scorers if we found the runs column
                if (runsIndex !== -1) {
                  const tempRunScorers: LeaderboardPlayer[] = playerData
                    .filter((player: (string | number)[]) => 
                      player[nameIndex] !== undefined && player[runsIndex] !== undefined)
                    .map((player: (string | number)[]) => ({
                      name: String(player[nameIndex]),
                      runs: Number(player[runsIndex]) || 0,
                      rank: 0 // Will be updated after sorting
                    }))
                    .sort((a: LeaderboardPlayer, b: LeaderboardPlayer) => 
                      (b.runs || 0) - (a.runs || 0)
                    )
                    .map((player: LeaderboardPlayer, index: number) => ({
                      ...player,
                      rank: index + 1
                    }))
                    .slice(0, 10); // Top 10 players
                  
                  setRunScorers(tempRunScorers);
                  console.log('Processed Run Scorers:', tempRunScorers);
                }
                
                // Process wicket takers if we found the wickets column
                if (wicketsIndex !== -1) {
                  const tempWicketTakers: LeaderboardPlayer[] = playerData
                    .filter((player: (string | number)[]) => 
                      player[nameIndex] !== undefined && player[wicketsIndex] !== undefined)
                    .map((player: (string | number)[]) => ({
                      name: String(player[nameIndex]),
                      wickets: Number(player[wicketsIndex]) || 0,
                      rank: 0 // Will be updated after sorting
                    }))
                    .sort((a: LeaderboardPlayer, b: LeaderboardPlayer) => 
                      (b.wickets || 0) - (a.wickets || 0)
                    )
                    .map((player: LeaderboardPlayer, index: number) => ({
                      ...player,
                      rank: index + 1
                    }))
                    .slice(0, 10); // Top 10 players
                  
                  setWicketTakers(tempWicketTakers);
                  console.log('Processed Wicket Takers:', tempWicketTakers);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Handle sorting for run scorers
  const handleSortRuns = (sortKey: string) => {
    setSortRunsBy(sortKey);
    
    // Sort the run scorers based on the selected key
    const sortedRunScorers = [...runScorers].sort((a, b) => {
      if (sortKey === 'rank') {
        return a.rank - b.rank;
      } else if (sortKey === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Default sort by runs
        return (b.runs || 0) - (a.runs || 0);
      }
    });
    
    setRunScorers(sortedRunScorers);
  };

  // Handle sorting for wicket takers
  const handleSortWickets = (sortKey: string) => {
    setSortWicketsBy(sortKey);
    
    // Sort the wicket takers based on the selected key
    const sortedWicketTakers = [...wicketTakers].sort((a, b) => {
      if (sortKey === 'rank') {
        return a.rank - b.rank;
      } else if (sortKey === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Default sort by wickets
        return (b.wickets || 0) - (a.wickets || 0);
      }
    });
    
    setWicketTakers(sortedWicketTakers);
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="container section">
          <Preloader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-page">
        <div className="container section">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <div className="container">
        <h1 className="section-title">Leaderboard</h1>
        
        <div className="leaderboard-container">
          {/* Leading Run Scorers */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              Leading Run Scorers
            </div>
            <div className="leaderboard-body">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th 
                      className={`rank-col sortable ${sortRunsBy === 'rank' ? 'active' : ''}`}
                      onClick={() => handleSortRuns('rank')}
                    >
                      Rank
                      {sortRunsBy === 'rank' && <span className="sort-icon">▼</span>}
                    </th>
                    <th 
                      className={`name-col sortable ${sortRunsBy === 'name' ? 'active' : ''}`}
                      onClick={() => handleSortRuns('name')}
                    >
                      Name
                      {sortRunsBy === 'name' && <span className="sort-icon">▼</span>}
                    </th>
                    <th 
                      className={`score-col sortable ${sortRunsBy === 'runs' ? 'active' : ''}`}
                      onClick={() => handleSortRuns('runs')}
                    >
                      Score
                      {sortRunsBy === 'runs' && <span className="sort-icon">▼</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {runScorers.map((player) => (
                    <tr key={`run-${player.rank}`}>
                      <td className="rank-cell">
                        {player.rank}
                      </td>
                      <td className="name-cell">
                        <Link to={`/players/${player.name}`}>{player.name}</Link>
                      </td>
                      <td className="score-cell">{player.runs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Leading Wicket Takers */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              Leading Wicket Takers
            </div>
            <div className="leaderboard-body">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th 
                      className={`rank-col sortable ${sortWicketsBy === 'rank' ? 'active' : ''}`}
                      onClick={() => handleSortWickets('rank')}
                    >
                      Rank
                      {sortWicketsBy === 'rank' && <span className="sort-icon">▼</span>}
                    </th>
                    <th 
                      className={`name-col sortable ${sortWicketsBy === 'name' ? 'active' : ''}`}
                      onClick={() => handleSortWickets('name')}
                    >
                      Name
                      {sortWicketsBy === 'name' && <span className="sort-icon">▼</span>}
                    </th>
                    <th 
                      className={`score-col sortable ${sortWicketsBy === 'wickets' ? 'active' : ''}`}
                      onClick={() => handleSortWickets('wickets')}
                    >
                      Score
                      {sortWicketsBy === 'wickets' && <span className="sort-icon">▼</span>}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {wicketTakers.map((player) => (
                    <tr key={`wicket-${player.rank}`}>
                      <td className="rank-cell">
                        {player.rank}
                      </td>
                      <td className="name-cell">
                        <Link to={`/players/${player.name}`}>{player.name}</Link>
                      </td>
                      <td className="score-cell">{player.wickets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;