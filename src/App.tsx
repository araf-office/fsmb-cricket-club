// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Players from './pages/Players'
import PlayerDetail from './pages/PlayerDetail'
import Leaderboard from './pages/Leaderboard'
import HallOfFame from './pages/HallofFame'

import Header from './components/common/Header'
import Footer from './components/common/Footer'
import './App.scss'


function App() {
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
      </div>
    </BrowserRouter>
  )
}

export default App