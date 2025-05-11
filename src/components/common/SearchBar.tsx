import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  name: string;
  role: string;
  rank: number;
  imageUrl?: string;
}

interface ExpandableSearchProps {
  players: SearchResult[];
  onSearch?: (results: SearchResult[]) => void;
}

const SearchBar: React.FC<ExpandableSearchProps> = ({ 
  players, 
  onSearch 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      if (onSearch) onSearch([]);
      return;
    }

    const filtered = players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.role.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    setResults(filtered);
    if (onSearch) onSearch(filtered);
  }, [players, onSearch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => performSearch(searchQuery), 300),
    [performSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
    setShowResults(true);
  };

  const handleResultClick = (playerName: string) => {
    navigate(`/players/${playerName}`);
    setQuery('');
    setShowResults(false);
    setIsExpanded(false);
  };

  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setQuery('');
      setResults([]);
      setShowResults(false);
    }
  };

  return (
    <div className="expandable-search" ref={searchContainerRef}>
      <motion.div 
        className={`search-container ${isExpanded ? 'expanded' : ''}`}
        animate={{ width: isExpanded ? '300px' : '44px' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <button 
          className="search-toggle"
          onClick={toggleSearch}
          aria-label={isExpanded ? "Close search" : "Open search"}
        >
          <i className="material-icons">
            {isExpanded ? 'close' : 'search'}
          </i>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="search-input-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={handleInputChange}
                placeholder="Search players..."
                className="search-input"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsExpanded(false);
                    setShowResults(false);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isExpanded && showResults && results.length > 0 && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {results.map((player) => (
              <div
                key={player.name}
                className="search-result-item"
                onClick={() => handleResultClick(player.name)}
              >
                <div 
                  className="result-image"
                  style={{ backgroundImage: `url(${player.imageUrl})` }}
                />
                <div className="result-info">
                  <div className="result-name">{player.name}</div>
                  <div className="result-role">{player.role} • Rank #{player.rank}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;