// src/pages/HallOfFame.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Preloader from '../components/common/PreLoader';
import { cacheService } from '../services/cacheService';
import { getPlayerImage } from '../utils/imageUtils';

// Define types for Hall of Fame data
interface HallOfFameEntry {
  name: string;
  year: string;
  category: string;
  achievement: string;
  stats: string;
  imageUrl?: string;
  playerNameForImage?: string;
}

interface CategoryData {
  name: string;
  description: string;
  entries: HallOfFameEntry[];
}

function HallOfFame() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadHallOfFameData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to load Hall of Fame data
  const loadHallOfFameData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Fetch data from cache service
      const summaryData = await cacheService.fetchSummaryData(forceRefresh);
      
      if (!summaryData || !summaryData.hallOfFame || !Array.isArray(summaryData.hallOfFame)) {
        throw new Error('Invalid Hall of Fame data format');
      }
      
      // Process the Hall of Fame data
      await processHallOfFameData(summaryData.hallOfFame);
      
    } catch (err) {
      console.error('Error loading Hall of Fame data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Process the Hall of Fame data from the spreadsheet
  const processHallOfFameData = async (hallOfFameData: (string | number | null)[][]) => {
    try {
      if (!hallOfFameData || hallOfFameData.length < 2) {
        throw new Error('Hall of Fame data is empty or invalid');
      }
      
      // Get header row
      const headers = hallOfFameData[0].map((header: string | number | null) => String(header));
      
      // Skip header row and parse entries
      const entries: HallOfFameEntry[] = [];
      for (let i = 1; i < hallOfFameData.length; i++) {
        const row = hallOfFameData[i];
        
        // Skip empty rows
        if (!row[0]) continue;
        
        const entry: HallOfFameEntry = {
          name: String(row[headers.indexOf('Player Name')] || ''),
          year: String(row[headers.indexOf('Year')] || ''),
          category: String(row[headers.indexOf('Category')] || ''),
          achievement: String(row[headers.indexOf('Achievement')] || ''),
          stats: String(row[headers.indexOf('Stats')] || ''),
          playerNameForImage: String(row[headers.indexOf('Player Name')] || ''),
        };
        
        entries.push(entry);
      }
      
      // Group entries by category
      const categoriesMap = new Map<string, HallOfFameEntry[]>();
      
      entries.forEach(entry => {
        if (!categoriesMap.has(entry.category)) {
          categoriesMap.set(entry.category, []);
        }
        categoriesMap.get(entry.category)?.push(entry);
      });
      
      // Sort entries by year (most recent first)
      categoriesMap.forEach(categoryEntries => {
        categoryEntries.sort((a, b) => {
          return parseInt(b.year) - parseInt(a.year);
        });
      });
      
      // Create categories array with descriptions
      const categoryDescriptions: { [key: string]: string } = {
        'Batting': 'Exceptional batting performances',
        'Bowling': 'Outstanding bowling achievements',
        'All-Rounder': 'Players who excelled in both batting and bowling',
        'Team': 'Remarkable team accomplishments',
        'Special': 'Special recognition and memorable moments'
      };
      
      const categoryData: CategoryData[] = Array.from(categoriesMap.entries()).map(([name, entries]) => ({
        name,
        description: categoryDescriptions[name] || 'Notable achievements',
        entries
      }));
      
      // Load player images
      for (const category of categoryData) {
        for (const entry of category.entries) {
          try {
            const imageUrl = await getPlayerImage({
              name: entry.name,
              playerNameForImage: entry.playerNameForImage || entry.name
            });
            entry.imageUrl = imageUrl;
          } catch (error) {
            console.error(`Error loading image for ${entry.name}:`, error);
          }
        }
      }
      
      setCategories(categoryData);
      
    } catch (error) {
      console.error('Error processing Hall of Fame data:', error);
      throw error;
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadHallOfFameData(true);
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="hall-of-fame-page">
        <div className="container section">
          <Preloader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hall-of-fame-page">
        <div className="container section">
          <div className="error">Error loading Hall of Fame data: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hall-of-fame-page">
      <div className="container">
        <section className="section hero-section">
          <div className="hero-content">
            <h1>Hall of Fame</h1>
            <p>Celebrating exceptional players and memorable moments in FSMB Cricket Club history</p>
          </div>
        </section>

        <section className="section categories-section">
          {categories.map((category, index) => (
            <div key={index} className="category-section">
              <h2>{category.name}</h2>
              <p className="category-description">{category.description}</p>
              
              <div className="fame-entries-grid">
                {category.entries.map((entry, entryIndex) => (
                  <div key={entryIndex} className="fame-entry-card">
                    <div className="entry-image-container">
                      <div 
                        className="entry-image" 
                        style={{ backgroundImage: `url(${entry.imageUrl})` }}
                      />
                      <div className="entry-year-badge">{entry.year}</div>
                    </div>
                    <div className="entry-info">
                      <h3 className="entry-name">
                        <Link to={`/players/${entry.name}`}>{entry.name}</Link>
                      </h3>
                      <p className="entry-achievement">{entry.achievement}</p>
                      <p className="entry-stats">{entry.stats}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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

export default HallOfFame;