// src/services/matchDataService.ts
import axios from 'axios';
import { cacheService } from './cacheService';

export interface TeamResult {
  teamName: string;
  result: 'Won' | 'Lost';
  score: string;
}

export interface PlayerTeamInfo {
  playerName: string;
  teams: string[];
  isManOfMatch?: boolean;
}

export interface LastMatchInfo {
  date: string;
  teams: TeamResult[];
  players: PlayerTeamInfo[];
}

interface MatchDataResponse {
  _metadata?: {
    lastUpdated: number;
  };
  'Match Data': unknown[][];
  [key: string]: unknown;
}

const CACHE_KEY = 'last_match_data';
const CACHE_METADATA_KEY = 'last_match_metadata';

// Helper function to convert column letter to index (A=0, B=1, etc.)
const columnToIndex = (column: string): number => {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
  }
  return index - 1;
};

// Parse match data from API response
const parseMatchData = (matchData: unknown[][]): LastMatchInfo | null => {
  console.log('Parsing match data:', matchData);
  
  // Skip header row
  const dataRows = matchData.slice(1);
  
  if (dataRows.length === 0) {
    console.error('No data rows found');
    return null;
  }
  
  // Based on your description, we know the exact columns:
  // A = Date, B = Player Name, U = Man of the Match (Yes/No), V = Team Name, W = Result, Y = Score
  const dateIndex = columnToIndex('A');    // 0
  const playerIndex = columnToIndex('B');  // 1
  const momIndex = columnToIndex('U');    // 20 - Man of the Match column (Yes/No)
  const teamIndex = columnToIndex('V');    // 21
  const resultIndex = columnToIndex('W');  // 22
  const scoreIndex = columnToIndex('Y');   // 24
  
  console.log('Column indices:', { dateIndex, playerIndex, momIndex, teamIndex, resultIndex, scoreIndex });
  
  // Extract data
  const firstRow = dataRows[0] as (string | number | unknown)[];
  const date = firstRow && firstRow[dateIndex] ? String(firstRow[dateIndex]) : 'Unknown Date';
  const teams: TeamResult[] = [];
  const players: PlayerTeamInfo[] = [];
  const playerMap = new Map<string, { teams: Set<string>; isManOfMatch: boolean }>();
  
  console.log('First row data:', firstRow);
  console.log('Extracted date:', date);
  
  // Process each row
  dataRows.forEach((row: unknown[], index: number) => {
    const rowData = row as (string | number | unknown)[];
    const teamName = rowData[teamIndex] ? String(rowData[teamIndex]) : '';
    const playerName = rowData[playerIndex] ? String(rowData[playerIndex]) : '';
    const result = rowData[resultIndex] ? String(rowData[resultIndex]) : '';
    const score = rowData[scoreIndex] ? String(rowData[scoreIndex]) : '';
    const momValue = rowData[momIndex] ? String(rowData[momIndex]).toLowerCase() : '';
    
    if (index < 5) {
      console.log(`Row ${index}:`, { teamName, playerName, result, score, momValue });
    }
    
    // Skip if team is "Both Teams"
    if (teamName && teamName !== 'Both Teams') {
      // Check if we already have this team
      const existingTeam = teams.find(t => t.teamName === teamName);
      
      if (!existingTeam) {
        teams.push({
          teamName,
          result: result.toLowerCase() === 'won' ? 'Won' : 'Lost',
          score
        });
      }
    }
    
    // Track players and their teams
    if (playerName && teamName) {
      if (!playerMap.has(playerName)) {
        playerMap.set(playerName, {
          teams: new Set(),
          isManOfMatch: false
        });
      }
      
      const playerData = playerMap.get(playerName)!;
      
      // Check if this player is Man of the Match
      // Column U has 'Yes' or 'No'
      if (momValue === 'yes' || momValue === 'y') {
        playerData.isManOfMatch = true;
      }
      
      if (teamName === 'Both Teams') {
        // If player played for both teams, add to both teams
        teams.forEach(team => {
          playerData.teams.add(team.teamName);
        });
      } else if (teamName !== 'Both Teams') {
        playerData.teams.add(teamName);
      }
    }
  });
  
  // Convert player map to array
  playerMap.forEach((playerData, playerName) => {
    players.push({
      playerName,
      teams: Array.from(playerData.teams),
      isManOfMatch: playerData.isManOfMatch
    });
  });
  
  const result = {
    date,
    teams,
    players
  };
  
  console.log('Parsed match data result:', result);
  
  return result;
};

export const fetchLastMatchData = async (forceRefresh = false): Promise<LastMatchInfo | null> => {
  try {
    // First check if we have cached data
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData && !cacheService.isCacheExpired(CACHE_KEY)) {
        console.log('Using cached match data');
        
        // Check for updates in background
        setTimeout(() => {
          checkForUpdatesInBackground();
        }, 1000);
        
        return JSON.parse(cachedData) as LastMatchInfo;
      }
    }
    
    console.log('Fetching fresh match data from API...');
    
    // If no cache or forced refresh, fetch from API
    const API_URL = 'https://script.google.com/macros/s/AKfycbwf0cA_04JPA151jIwSffoiTJZqox18ybxD2bsKcPja84Mi8d_8HJEbmSRnCh0b5nl8/exec';
    const response = await axios.get<MatchDataResponse>(`${API_URL}?type=all`);
    
    console.log('API response:', response.data);
    
    if (!response.data || !response.data['Match Data']) {
      console.error('No match data found in API response');
      // Try to use cached data as fallback
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        console.log('Using cached data as fallback');
        return JSON.parse(cachedData) as LastMatchInfo;
      }
      return null;
    }
    
    const matchData = response.data['Match Data'];
    const parsedData = parseMatchData(matchData);
    
    if (parsedData) {
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify(parsedData));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
      
      // Store metadata for update checking
      const metadata = {
        lastUpdated: Date.now(),
        matchDate: parsedData.date
      };
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      
      console.log('Data cached successfully');
    } else {
      console.error('Failed to parse match data');
    }
    
    return parsedData;
    
  } catch (error) {
    console.error('Error fetching match data:', error);
    
    // Try to use cached data as fallback
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      console.log('Using cached data as fallback after error');
      return JSON.parse(cachedData) as LastMatchInfo;
    }
    
    return null;
  }
};

// Background update check
const checkForUpdatesInBackground = async (): Promise<void> => {
  try {
    // Check if data needs update
    const needsUpdate = await cacheService.checkForUpdates();
    if (needsUpdate) {
      console.log('Match data needs update, fetching in background...');
      await fetchLastMatchData(true);
    }
  } catch (error) {
    console.error('Error checking for updates in background:', error);
  }
};

// Prefetch match data (call this when app loads)
export const prefetchMatchData = async (): Promise<void> => {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (!cachedData || cacheService.isCacheExpired(CACHE_KEY)) {
    console.log('Prefetching match data...');
    await fetchLastMatchData(true);
  } else {
    console.log('Match data already cached, skipping prefetch');
  }
};