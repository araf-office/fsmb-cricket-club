// src/components/common/GoToTop.tsx
import { useEffect, useState } from 'react';

interface GoToTopProps {
  scrollThreshold?: number;
}

function GoToTop({ scrollThreshold = 300 }: GoToTopProps) {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Only render the button if scrolled beyond threshold
  if (scrollY <= scrollThreshold) {
    return null;
  }
  
  return (
    <div 
      onClick={scrollToTop}
      className="go-to-top"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        backgroundColor: '#2D7783',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 100,
        transition: 'transform 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <i className="material-icons">arrow_upward</i>
    </div>
  );
}

export default GoToTop;