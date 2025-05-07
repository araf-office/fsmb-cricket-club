// src/components/common/Header.tsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  
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
          <img src={logo} alt="FSMB Office Cricket" />
          <span>FSMB Office Cricket</span>
        </Link>
        
        <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/players" onClick={() => setMenuOpen(false)}>Players</Link></li>
            <li><Link to="/HallOfFame" onClick={() => setMenuOpen(false)}>Hall of Fame</Link></li>
            <li><Link to="#" onClick={() => setMenuOpen(false)}>Matches</Link></li>
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