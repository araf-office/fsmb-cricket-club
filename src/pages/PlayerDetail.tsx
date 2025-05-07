// src/pages/PlayerDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePlayerData } from '../hooks/usePlayerData';
import { getPlayerImage } from '../utils/imageUtils';
import { PlayerData } from '../types/playerTypes';
import Preloader from '../components/common/PreLoader';
import { cacheService } from '../services/cacheService';
import MatchModal from '../components/player/MatchModal';

// Define type for match data
interface MatchData {
  Date?: string;
  'Player Name'?: string;
  'Matches'?: number | string;
  'Runs Scored'?: number | string;
  'Balls Faced'?: number | string;
  'Dismissals'?: number | string;
  'Runs Given'?: number | string;
  'Balls Bowled'?: number | string;
  'Wickets Taken'?: number | string;
  'Dots Taken'?: number | string;
  'Twos Takes'?: number | string;
  'Fours Taken'?: number | string;
  'Penalty'?: number | string;
  'Dots Given'?: number | string;
  'Twos Given'?: number | string;
  'Fours Given'?: number | string;
  'Extras'?: number | string;
  'Hattricks'?: number | string;
  'Maidens'?: number | string;
  'Match Score'?: string;
  'Man of the Match'?: string;
  'Team Name'?: string;
  'Result'?: string;
  [key: string]: string | number | undefined;
}

// Define performance data type
interface PerformanceData {
  date: string;
  match: string;
  runs: number;
  balls: number;
  wickets: number;
  economy?: number | string;
}

// Define which columns to display in the matches table
// const matchColumnsToDisplay = [
//   'Date',
//   'Runs Scored',
//   'Balls Faced',
//   'Dismissals',
//   'Runs Given',
//   'Balls Bowled',
//   'Wickets Taken',
//   'Dots Taken',
//   'Twos Takes',
//   'Fours Taken',
//   'Penalty',
//   'Dots Given',
//   'Twos Given',
//   'Fours Given',
//   'Extras',
//   'Hattricks',
//   'Maidens',
//   'Match Score',
//   'Man of the Match',
//   'Team Name',
//   'Result'
// ];

function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players, loading: playersLoading, error: playersError } = usePlayerData();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [playerMatches, setPlayerMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  
  // Determine player role based on stats
  const determinePlayerRole = (playerData: PlayerData): string => {
    const BATTING_RATING_THRESHOLD = 150; 
    const BOWLING_RATING_THRESHOLD = 50;
    
    // Check if player meets both criteria for an all-rounder
    if (playerData.battingRating >= BATTING_RATING_THRESHOLD && 
        playerData.bowlingRating >= BOWLING_RATING_THRESHOLD) {
      return 'All-Rounder';
    }
    
    // Check if player is primarily a batsman
    if (playerData.battingRating >= BATTING_RATING_THRESHOLD) {
      return 'Batsman';
    }
    
    // Check if player is primarily a bowler
    if (playerData.bowlingRating >= BOWLING_RATING_THRESHOLD) {
      return 'Bowler';
    }
    
    // When nothing meets the criteria, return N/A instead of a default
    return 'N/A';
  };
  
  // First find the player and set basic data
  useEffect(() => {
    if (!id) return;
    
    // Check if we already have this player and just need their matches
    if (player && player.name === id && playerMatches.length === 0) {
      loadPlayerMatches(id);
      return;
    }
    
    // Find player from the players list
    if (!playersLoading && players.length > 0) {
      const foundPlayer = players.find(p => p.name === id);
      
      if (foundPlayer) {
        console.log("Player found in list:", foundPlayer.name);
        console.log("Batting rating:", foundPlayer.battingRating);
        console.log("Bowling rating:", foundPlayer.bowlingRating);
        
        // Determine role based on ratings with the correct thresholds
        const playerRole = determinePlayerRole(foundPlayer);
        console.log("Calculated role:", playerRole);
        
        // Set player with correct role
        setPlayer({
          ...foundPlayer,
          role: playerRole
        });
        
        // Load player images and matches
        loadPlayerImageAndMatches(foundPlayer);
      } else {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, players, playersLoading]);
  
  // Function to load player image
  const loadPlayerImageAndMatches = useCallback(async (playerData: PlayerData) => {
    try {
      // Load image first to prevent issues with image loading on navigation
      const imageUrl = await getPlayerImage({
        name: playerData.name,
        playerNameForImage: playerData.playerNameForImage
      });
      
      // Update player with image
      setPlayer(prevPlayer => {
        if (!prevPlayer) return null;
        return {
          ...prevPlayer,
          imageUrl
        };
      });
      
      // Now load the matches data
      loadPlayerMatches(playerData.name);
    } catch (error) {
      console.error("Error loading player image:", error);
      // Still try to load matches even if image fails
      loadPlayerMatches(playerData.name);
    }
  }, []);
  
  // Load match data
  const loadPlayerMatches = async (playerName: string) => {
    try {
      // Fetch player matches from cache or API
      const playerDetails = await cacheService.fetchPlayerDetails(playerName);
      
      if (playerDetails && playerDetails.matches && Array.isArray(playerDetails.matches)) {
        // Process match data - safely handle headers
        if (playerDetails.matches.length > 0) {
          const headerRow = playerDetails.matches[0]; 
          const headers = headerRow.map(item => String(item));
          
          // Process data rows
          const matchData = playerDetails.matches.slice(1).map((row: Array<string | number>) => {
            const match: MatchData = {};
            headers.forEach((header: string, index: number) => {
              match[header] = row[index];
            });
            return match;
          });
          
          setPlayerMatches(matchData);
          
          // Update performance data
          setPlayer(prevPlayer => {
            if (!prevPlayer) return null;
            
            const performanceData: PerformanceData[] = matchData.map(match => ({
              date: String(match['Date'] || 'Unknown'),
              match: match['Date'] ? new Date(String(match['Date'])).toLocaleDateString() : 'Unknown',
              runs: Number(match['Runs Scored'] || 0),
              balls: Number(match['Balls Faced'] || 0),
              wickets: Number(match['Wickets Taken'] || 0),
              economy: match['Balls Bowled'] && Number(match['Balls Bowled']) > 0 ? 
                (Number(match['Runs Given'] || 0) / Number(match['Balls Bowled']) * 6).toFixed(2) : 0
            }));
            
            return {...prevPlayer, performanceData};
          });
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading player matches:", error);
      setLoading(false);
    }
  };
  
  // Go back handler
  const handleGoBack = () => {
    navigate(-1);
  };
  

  
  const renderMatchModals = () => {
    if (!playerMatches || playerMatches.length === 0) {
      return <p>No match data available</p>;
    }
    
    return (
    <div className="matches-container">
      {playerMatches.map((match, index) => (
        <MatchModal 
          key={index} 
          match={match} 
          index={index}
          openModalIndex={openModalIndex}
          setOpenModalIndex={setOpenModalIndex}
        />
      ))}
    </div>
    );
  };
  
  if (playersLoading || loading) {
    return (
      <div className="player-detail-page">
        <div className="container section">
          <Preloader />
        </div>
      </div>
    );
  }
  
  if (playersError) {
    return (
      <div className="player-detail-page">
        <div className="container section">
          <div className="error">Error loading player data: {playersError.message}</div>
        </div>
      </div>
    );
  }
  
  if (!player) {
    return (
      <div className="player-detail-page">
        <div className="container section">
          <div className="error">Player not found</div>
        </div>
      </div>
    );
  }
  
  // Make sure we have performanceData to avoid rendering errors
  const performanceData = player.performanceData || [];
  
  return (
    <div className="player-detail-page">
      <div className="container">
        <div className="back-button-container">
          <button className="btn btn-sm btn-secondary back-button" onClick={handleGoBack}>
            &larr; Back to Players
          </button>
        </div>
        
        <section className="section player-header">
          <div className="player-profile">
            <div className="player-image-container">
              <div 
                className="player-image" 
                style={{ backgroundImage: `url(${player.imageUrl || player.fallbackImageUrl})` }}
              />
              <div className="player-team">Rank #{player.rank}</div>
            </div>
            <div className="player-info">
              <h1 className="player-name">{player.name}</h1>
              <p className="player-role">{player.role}</p>
              <div className="player-contact">
                <div className="contact-item">
                  <span className="label">Matches:</span>
                  <span className="value">{player.matches}</span>
                </div>
                <div className="contact-item">
                  <span className="label">Win %:</span>
                  <span className="value">{player.winPercentage.toFixed(1)}%</span>
                </div>
                <div className="contact-item">
                  <span className="label">MoM Awards:</span>
                  <span className="value">{player.momAwards}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      

      <section className="section player-statistics">
        <h2 className="section-title">Player Statistics</h2>
        
        <div className="stats-grid">
          <div className="card">
            <div className="card-header">
              <h3>Batting Stats</h3>
            </div>
            <div className="card-body">
              <div className="stats-list">
                <div className="stat-item">
                  <span className="label">Matches / Innings / Runs</span>
                  <span className="value">{player.matches} / {player.innings} / {player.runsScored}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Highest Score</span>
                  <span className="value">{player.highestScore}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Average</span>
                  <span className="value">{player.battingAverage.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Strike Rate</span>
                  <span className="value">{player.strikeRate.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">30s / 50s / 70s</span>
                  <span className="value">{player.thirties} / {player.fifties} / {player.seventies}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Boundary %</span>
                  <span className="value">{player.boundaryPercentage.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Dots / Singles / Twos / Fours</span>
                  <span className="value">{player.dotsTaken} / {player.singlesTaken} / {player.twosTaken} / {player.foursTaken}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Penalty</span>
                  <span className="value">{player.extras || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Ducks / Golden Ducks</span>
                  <span className="value">{player.ducks} / {player.goldenDucks}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Bowling Stats</h3>
            </div>
            <div className="card-body">
              <div className="stats-list">
                <div className="stat-item">
                  <span className="label">Wickets</span>
                  <span className="value">{player.wicketsTaken}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Runs Given</span>
                  <span className="value">{player.runsGiven}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Balls Bowled</span>
                  <span className="value">{player.ballsBowled}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Economy</span>
                  <span className="value">{player.economy.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Average</span>
                  <span className="value">{player.bowlingAverage > 0 ? player.bowlingAverage.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Strike Rate</span>
                  <span className="value">{player.bowlingStrikeRate.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Best Bowling</span>
                  <span className="value">{player.bestBowling || 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="label">3W / 5W</span>
                  <span className="value">{player.threeWickets} / {player.fiveWickets}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Hattricks</span>
                  <span className="value">{player.hattricks}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Maidens</span>
                  <span className="value">{player.maidens}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Dots / Twos / Fours / Extras</span>
                  <span className="value">{player.dotsGiven} / {player.twosGiven} / {player.foursGiven} / {player.extras}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Rating Stats</h3>
            </div>
            <div className="card-body">
              <div className="stats-list">
                <div className="stat-item">
                  <span className="label">Batting Rating</span>
                  <span className="value">{player.battingRating.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Bowling Rating</span>
                  <span className="value">{player.bowlingRating.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">All-Rounder Rating</span>
                  <span className="value">{player.allRounderRating.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Overall Rating</span>
                  <span className="value">{player.overallRating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        
        <section className="section player-performance">
          <h2 className="section-title">Performance</h2>
          
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h3>Runs per Match</h3>
              </div>
              <div className="card-body chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="match" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="runs" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Wickets per Match</h3>
              </div>
              <div className="card-body chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="match" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wickets" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
        
        <section className="section player-matches">
          <h2 className="section-title">Match Statistics</h2>
          {renderMatchModals()}
        </section>
      </div>
    </div>
  );
}

export default PlayerDetail;