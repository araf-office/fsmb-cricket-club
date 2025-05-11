// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Players from './pages/Players'
import PlayerDetail from './pages/PlayerDetail'
import Leaderboard from './pages/Leaderboard'
import HallOfFame  from './pages/HallofFame'

import { themeService } from './services/themeService'
import { fontService } from './services/fontService'

import Header from './components/common/Header'
import Footer from './components/common/Footer'
import GoToTop from './components/common/GoToTop'
import './App.scss'
import { useEffect } from 'react'


function App() {
  useEffect(() => {
  // Initialize theme on app load
  themeService.initializeTheme();
}, []);
useEffect(() => {
  // Initialize theme on app load
  themeService.initializeTheme();
  
  // Initialize fonts
  fontService.initializeFonts();
}, []);
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Add GoToTop component globally */}
        <GoToTop />
      </div>
    </BrowserRouter>
  )
}

export default App