import { useState, useEffect } from 'react'
import GameSelection from './components/GameSelection'
import OpenBorPlayer from './components/OpenBorPlayer'
import gamesData from './games.json'
import './App.css'

function App() {
  const [selectedGame, setSelectedGame] = useState(null)
  const [heroGame, setHeroGame] = useState(null)

  useEffect(() => {
    if (gamesData.length > 0) {
      // Pick a random game from Featured Classics for the hero
      const featured = gamesData.filter(g => g.category === 'Featured Classics');
      const pool = featured.length > 0 ? featured : gamesData;
      setHeroGame(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [])

  if (selectedGame) {
    return (
      <div className="app-container player-mode">
        <OpenBorPlayer 
          game={selectedGame} 
          onExit={() => setSelectedGame(null)} 
        />
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Navbar overlay */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo-text">OpenBOR</span>
        </div>
      </nav>

      {/* Hero Section */}
      {heroGame && (
        <div className="hero-section" style={{ backgroundImage: `url(${heroGame.coverUrl})` }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">{heroGame.title}</h1>
            <p className="hero-description">{heroGame.description}</p>
            <div className="hero-buttons">
              <button className="btn-play" onClick={() => setSelectedGame(heroGame)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Selection Carousels */}
      <div className="main-content">
        <GameSelection games={gamesData} onSelectGame={setSelectedGame} />
      </div>
    </div>
  )
}

export default App
