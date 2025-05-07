// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Players from './pages/Players'
import PlayerDetail from './pages/PlayerDetail'
// import Matches from './pages/Matches'
// import LiveMatch from './pages/LiveMatch'
import HallOfFame from './pages/HallOfFame'
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
            {/* Uncomment the following routes when the components are ready */}
            {/* <Route path="/matches" element={<Matches />} />
            <Route path="/live" element={<LiveMatch />} />
             */}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App