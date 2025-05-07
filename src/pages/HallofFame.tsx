// src/pages/HallOfFame.tsx
import { useState, useEffect } from 'react';
import { cacheService } from '../services/cacheService';
import Preloader from '../components/common/PreLoader';

// Removed unused HallOfFameData interface

function HallOfFame() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hallOfFameData, setHallOfFameData] = useState<string[][]>([]);

  // Categories for organizing the data
  const categories = [
    { title: 'Batting Criteria', color: '#e6f0ff' },
    { title: 'Bowling Criteria', color: '#e6ffe6' },
    { title: 'General Criteria', color: '#fff2e6' },
    { title: 'All Time Criteria', color: '#ffe6e6' }
  ];

  useEffect(() => {
    const fetchHallOfFameData = async () => {
      try {
        setLoading(true);
        // Fetch summary data which should contain hall of fame info
        const summaryData = await cacheService.fetchSummaryData();
        
        // Check if the data contains the hallOfFame array
        if (summaryData && summaryData.hallOfFame && Array.isArray(summaryData.hallOfFame)) {
          // Get only the relevant rows (0-18)
          const relevantData = summaryData.hallOfFame.slice(0, 19);
          console.log('Hall of Fame Data:', relevantData);
          setHallOfFameData(relevantData);
        } else {
          setError('Hall of Fame data not found or in unexpected format');
        }
      } catch (err) {
        console.error('Error fetching Hall of Fame data:', err);
        setError('Failed to load Hall of Fame data');
      } finally {
        setLoading(false);
      }
    };

    fetchHallOfFameData();
  }, []);

  // Function to get column indices for each category
  const getCategoryColumns = (categoryIndex: number) => {
    // This is based on the data structure shown
    // Format: [criteria_start, player_start, score_start, criteria_end]
    switch (categoryIndex) {
      case 0: return [0, 1, 2, 3]; // Batting Criteria
      case 1: return [4, 5, 6, 7]; // Bowling Criteria
      case 2: return [8, 9, 10, 11]; // General Criteria
      case 3: return [12, 13, 14, 15]; // All Time Criteria
      default: return [0, 0, 0, 0];
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
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  // Header row exists at index 0
//   const headerRow = hallOfFameData.length > 0 ? hallOfFameData[0] : [];

  return (
    <div className="hall-of-fame-page">
      <div className="container">
        <h1 className="section-title">Hall of Fame</h1>
        <p className="section-subtitle">Celebrating our top performers across all categories</p>

        <div className="hall-of-fame-grid">
          {categories.map((category, categoryIndex) => {
            const [criteriaCol, playerCol, scoreCol] = getCategoryColumns(categoryIndex);
            
            return (
              <div key={categoryIndex} className="category-section" style={{ backgroundColor: category.color }}>
                <h2 className="category-title">{category.title}</h2>
                <div className="category-items">
                  {hallOfFameData.slice(1, 19).map((row, rowIndex) => {
                    // Skip empty rows
                    if (!row[criteriaCol] || row[criteriaCol] === '') return null;
                    
                    return (
                      <div key={rowIndex} className="achievement-item">
                        <div className="achievement-criteria">{row[criteriaCol]}</div>
                        <div className="achievement-player">{row[playerCol]}</div>
                        <div className="achievement-score">{row[scoreCol]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="notes-section">
          <p><strong>Note:</strong> Stats are stored starting from 10/04/2025.</p>
          <p><strong>Note:</strong> If multiple players have the same score, the one having the better rank is considered.</p>
        </div>
      </div>
    </div>
  );
}

export default HallOfFame;