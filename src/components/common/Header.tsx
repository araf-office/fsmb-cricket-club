// src/components/common/Header.tsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isHomePage ? 'home-page' : 'other-page'}`}>
      <div className="header-inner">

        <Link to="/" className="logo">
          <img src={logo} alt="Amader Cricket" />
          <span>Amader Cricket</span>
        </Link>
        
        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/"             className={isActive('/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/players"      className={isActive('/players') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Players</Link></li>
            <li><Link to="/hall-of-fame" className={isActive('/hall-of-fame') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Hall of Fame</Link></li>
            <li><Link to="/leaderboard"  className={isActive('/leaderboard') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Leaderboard</Link></li>
            <li><Link to="#" onClick={() => setMenuOpen(false)}>Live Match</Link></li>
            
          </ul>
        </nav>

         {/* Right: Live Now Button */}
        <div className="live-now">
          <span className="dot"></span>
          <span>Live Now</span>
        </div>
      </div>
    </header>
  )
}

export default Header