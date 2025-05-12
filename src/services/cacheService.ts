// src/services/cacheService.ts
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';



// Cache keys
const METADATA_KEY = API_CONFIG.METADATA_KEY;
const SUMMARY_KEY = API_CONFIG.SUMMARY_KEY;
const PLAYERS_KEY = API_CONFIG.PLAYERS_KEY;
const PLAYER_PREFIX = API_CONFIG.PLAYER_PREFIX;

// Cache TTL (24 hours in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheMetadata {
  lastUpdated: number;
  version: string;
}

// Define more explicit types for our data
interface SummaryData {
  teams: Record<string, unknown>;
  matches: Array<unknown>;
  [key: string]: unknown;
}

interface PlayersData {
  stats: Array<Array<string | number>>;
  lastUpdated?: string;
  [key: string]: unknown;
}

interface PlayerDetailsData {
  matches: Array<Array<string | number>>;
  stats: Record<string, unknown>;
  lastUpdated?: string;
  [key: string]: unknown;
}

export const cacheService = {
  // Check if data needs updating - but this now runs in the background
  async checkForUpdates(): Promise<boolean> {
    try {
      // Get the latest metadata from server
      const response = await axios.get(`${API_CONFIG.baseUrl}?type=checkUpdate`);
      const serverMetadata: CacheMetadata = response.data;
      
      // Get our stored metadata
      const storedMetadataJson = localStorage.getItem(METADATA_KEY);
      
      if (!storedMetadataJson) {
        // No stored metadata, we need to update
        localStorage.setItem(METADATA_KEY, JSON.stringify(serverMetadata));
        return true;
      }
      
      const storedMetadata = JSON.parse(storedMetadataJson) as CacheMetadata;
      
      // Check if server data is newer
      if (serverMetadata.lastUpdated > storedMetadata.lastUpdated || 
          serverMetadata.version !== storedMetadata.version) {
        // Update metadata
        localStorage.setItem(METADATA_KEY, JSON.stringify(serverMetadata));
        return true; // Update needed
      }
      
      return false; // No update needed
    } catch (error) {
      console.error("Error checking for updates:", error);
      return false; // If error, don't trigger refresh - use existing cache
    }
  },

  // Check if cache is expired
  isCacheExpired(key: string): boolean {
    const timestampKey = `${key}_timestamp`;
    const timestamp = localStorage.getItem(timestampKey);
    
    if (!timestamp) return true;
    
    const savedTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    
    return currentTime - savedTime > CACHE_TTL;
  },
  
  // Fetch summary data (home page data)
  async fetchSummaryData(forceRefresh = false): Promise<SummaryData> {
    const cacheKey = SUMMARY_KEY;
    // const timestampKey = `${cacheKey}_timestamp`;
    
    try {
      // Check if cache exists and is valid - use immediately if available
      const cachedData = localStorage.getItem(cacheKey);
      const isExpired = this.isCacheExpired(cacheKey);
      
      if (cachedData && !isExpired && !forceRefresh) {
        console.log("Using cached summary data");
        
        // Check for updates in the background
        setTimeout(() => {
          this.checkForUpdates().then(needsUpdate => {
            if (needsUpdate) {
              this.fetchFromApiAndCache<SummaryData>(`${API_CONFIG.baseUrl}?type=summary`, cacheKey);
            }
          });
        }, 500);
        
        return JSON.parse(cachedData) as SummaryData;
      }
      
      // Fetch fresh data
      return await this.fetchFromApiAndCache<SummaryData>(`${API_CONFIG.baseUrl}?type=summary`, cacheKey);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      
      // Try to use cached data as fallback even if expired
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log("Using expired cached data as fallback");
        return JSON.parse(cachedData) as SummaryData;
      }
      
      // If no cache at all, return empty data
      return { teams: {}, matches: [] };
    }
  },
  
  // Fetch players list with stats
  async fetchPlayers(forceRefresh = false): Promise<PlayersData> {
    const cacheKey = PLAYERS_KEY;
    
    try {
      // Check if cache exists and is valid
      const cachedData = localStorage.getItem(cacheKey);
      const isExpired = this.isCacheExpired(cacheKey);
      
      if (cachedData && !isExpired && !forceRefresh) {
        console.log("Using cached players data");
        
        // Check for updates in the background
        setTimeout(() => {
          this.checkForUpdates().then(needsUpdate => {
            if (needsUpdate) {
              this.fetchFromApiAndCache<PlayersData>(`${API_CONFIG.baseUrl}?type=players`, cacheKey);
            }
          });
        }, 500);
        
        return JSON.parse(cachedData) as PlayersData;
      }
      
      // Fetch fresh data
      return await this.fetchFromApiAndCache<PlayersData>(`${API_CONFIG.baseUrl}?type=players`, cacheKey);
    } catch (error) {
      console.error("Error fetching players:", error);
      
      // Try to use cached data as fallback even if expired
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log("Using expired cached data as fallback");
        return JSON.parse(cachedData) as PlayersData;
      }
      
      // If no cache at all, return empty data
      return { stats: [] };
    }
  },
  
  // Generic fetch and cache method
  async fetchFromApiAndCache<T>(url: string, cacheKey: string): Promise<T> {
    console.log(`Fetching data from ${url}`);
    const response = await axios.get(url);
    const data = response.data as T;
    
    // Cache the data with timestamp
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    
    return data;
  },
  
  // Fetch a specific player's details - optimized with background updates
  async fetchPlayerDetails(playerName: string, forceRefresh = false): Promise<PlayerDetailsData> {
    if (!playerName) {
      throw new Error("Player name is required");
    }
    
    const cacheKey = `${PLAYER_PREFIX}${playerName}`;
    
    try {
      // First, check if we have cached data
      const cachedData = localStorage.getItem(cacheKey);
      const isExpired = this.isCacheExpired(cacheKey);
      
      if (cachedData && !isExpired && !forceRefresh) {
        // Return cached data immediately
        console.log(`Using cached data for player ${playerName}`);
        
        // Check for updates in the background
        setTimeout(() => {
          this.checkForUpdates().then(needsUpdate => {
            if (needsUpdate) {
              // If data needs updating, fetch in the background and update cache
              this.fetchPlayerDetails(playerName, true);
            }
          });
        }, 100);
        
        return JSON.parse(cachedData) as PlayerDetailsData;
      }
      
      // Fetch fresh data
      console.log(`Fetching player details for ${playerName}`);
      const response = await axios.get(`${API_CONFIG.baseUrl}?type=playerDetails&name=${encodeURIComponent(playerName)}`);
      const data = response.data as PlayerDetailsData;
      
      // Cache the data with timestamp
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      
      return data;
    } catch (error) {
      console.error(`Error fetching player ${playerName}:`, error);
      
      // Try to use cached data as fallback even if expired
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`Using expired cache as fallback for player ${playerName}`);
        return JSON.parse(cachedData) as PlayerDetailsData;
      }
      
      // Return empty data if nothing in cache
      return { matches: [], stats: {} };
    }
  },
  
  // Background fetch player details for all players - with throttling
  async prefetchAllPlayerDetails(playerNames: string[]): Promise<void> {
    console.log("Starting background prefetch of player details");
    
    // We'll only prefetch a limited number of players to avoid slowing down the app
    const MAX_PREFETCH = 5;
    const playersToPrefetch = playerNames.slice(0, MAX_PREFETCH);
    
    // Use a small delay between requests to avoid overwhelming the server
    for (const playerName of playersToPrefetch) {
      try {
        const cacheKey = `${PLAYER_PREFIX}${playerName}`;
        const isExpired = this.isCacheExpired(cacheKey);
        
        // Only fetch if not already cached or expired
        if (!localStorage.getItem(cacheKey) || isExpired) {
          await this.fetchPlayerDetails(playerName);
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error prefetching player ${playerName}:`, error);
        // Continue with next player even if one fails
      }
    }
    
    console.log("Background prefetch complete");
  },
  
  // Clear all cache data
  clearCache(): void {
    // Clear known keys
    localStorage.removeItem(METADATA_KEY);
    localStorage.removeItem(SUMMARY_KEY);
    localStorage.removeItem(PLAYERS_KEY);
    
    // Clear timestamps
    localStorage.removeItem(`${SUMMARY_KEY}_timestamp`);
    localStorage.removeItem(`${PLAYERS_KEY}_timestamp`);
    
    // Clear player-specific caches
    const playerKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(PLAYER_PREFIX)
    );
    
    playerKeys.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    });
    
    console.log("Cache cleared");
  }
};