// src/components/home/HeroSection.tsx
import { useEffect, useState, useRef } from 'react'

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  // Using smaller, optimized images
  const slides = [
    {
      // Use a small, compressed image - these are just examples
      imageUrl: 'https://images.pexels.com/photos/3404474/pexels-photo-3404474.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'FSMB Cricket Club',
      subtitle: 'Where Colleagues Become Competitors',
    },
    {
      imageUrl: 'https://images.pexels.com/photos/3657154/pexels-photo-3657154.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Office League',
      subtitle: 'Every Friday at the Company Grounds',
    },
    {
      imageUrl: 'https://images.pexels.com/photos/2986309/pexels-photo-2986309.jpeg?auto=compress&cs=tinysrgb&w=1200',
      title: 'Join the Game',
      subtitle: 'Sign up for the next match',
    }
  ];

  // More efficient animation handling
  useEffect(() => {
    // Clear previous interval if it exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set new interval
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slides.length]);
  
  return (
    <section className="hero-section">
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            // Only load the current and next image to save resources
            style={index === currentSlide || index === (currentSlide + 1) % slides.length ? { backgroundImage: `url(${slide.imageUrl})` } : {}}
          >
            <div className="overlay">
              <div className="hero-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <div className="button-group">
                  <a href="#upcoming-matches" className="btn btn-accent">Upcoming Matches</a>
                  <a href="#players" className="btn btn-outline-light">Our Players</a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HeroSection