// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import UpcomingMatches from '../components/home/UpcomingMatches';
import RecentResults from '../components/home/RecentResults';
import TeamStats from '../components/home/TeamStats';
import DataTester from '../components/DataTester';
import { cacheService } from '../services/cacheService';

// Define types for API responses
interface PlayersData {
  stats: Array<Array<string | number>>;
  lastUpdated?: string;
  [key: string]: unknown;
}







function Home() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize cache and prefetch data when component mounts
  useEffect(() => {
    async function initializeData() {
      try {
        // Get summary data (includes stats, leaderboards, hall of fame)

        async function fetchHallOfFameData() {
          try {
            // Fetch summary data which should contain leaderboards
            const summaryData = await cacheService.fetchSummaryData();
            console.log('Hall of Fame Data:', summaryData);
            
            // Fetch players data to get additional details
            const playersData = await cacheService.fetchPlayers();
            console.log('Players Data:', playersData);
            
            return { summaryData, playersData };
          } catch (error) {
            console.error('Error fetching Hall of Fame data:', error);
            throw error;
          }
        }
        
        // Call this function to see the data structure
        fetchHallOfFameData();

        await cacheService.fetchSummaryData();
        
        // Get players data
        const playersData = await cacheService.fetchPlayers() as PlayersData;
        
        // Start background prefetching of player details if we have player names
        if (playersData && playersData.stats && playersData.stats.length > 1) {
          // Extract player names from the first column (skip header row)
          const playerNames = playersData.stats.slice(1)
            .map((row: Array<string | number>) => String(row[0]))
            .filter((name: string) => name);
          
          // Prefetch player details in the background
          setTimeout(() => {
            cacheService.prefetchAllPlayerDetails(playerNames);
          }, 2000); // Delay to allow page to render first
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    }
    
    initializeData();
  }, []);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Clear all cache and fetch fresh data
      cacheService.clearCache();
      await cacheService.fetchSummaryData(true);
      await cacheService.fetchPlayers(true);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="home-page">
      <HeroSection />
      <div className="container">
        <DataTester />
        <section className="section">
          <div className="matches-section">
            <UpcomingMatches />
            <RecentResults />
          </div>
        </section>
        <section className="section">
          <TeamStats />
        </section>
      </div>
      
      {/* Refresh Button */}
      <div className="refresh-container">
        <button 
          className="btn btn-sm btn-primary refresh-button" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}

export default Home;