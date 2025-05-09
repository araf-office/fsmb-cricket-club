// src/pages/Home.tsx
import HeroSection from '../components/home/HeroSection';
import TeamStats from '../components/home/TeamStats';


function Home() {
  return (
    <div className="home-page">
      <HeroSection />
      <div className="container">
        <section className="section">
          <TeamStats />
        </section>
      </div>
      
    </div>
  );
}

export default Home;