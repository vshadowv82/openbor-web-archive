import { useState, useEffect, useMemo, useRef } from 'react'
import GameSelection from './components/GameSelection'
import OpenBorPlayer from './components/OpenBorPlayer'
import gamesData from './games.json'
import './App.css'

function App() {
  const [selectedGame, setSelectedGame] = useState(null)
  const [heroGame, setHeroGame] = useState(null)
  
  // Gamepad Navigation State
  const [focusedRow, setFocusedRow] = useState(-1) // -1 = Hero, 0+ = Carousels
  const [focusedCol, setFocusedCol] = useState(0)
  
  // Debounce for gamepad input
  const lastInputTime = useRef(0)
  const INPUT_DELAY = 150; // ms between movements

  // Group games by category
  const categories = useMemo(() => {
    const grouped = {};
    gamesData.forEach(game => {
      const cat = game.category || 'More Games';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(game);
    });
    
    // Sort logic (ensure Featured Classics is first)
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      if (a === 'Featured Classics') return -1;
      if (b === 'Featured Classics') return 1;
      return a.localeCompare(b);
    });

    return sortedCategories.map(name => ({
      name,
      games: grouped[name]
    }));
  }, []);

  useEffect(() => {
    if (gamesData.length > 0) {
      // Pick a random game from Featured Classics for the hero
      const featured = gamesData.filter(g => g.category === 'Featured Classics');
      const pool = featured.length > 0 ? featured : gamesData;
      setHeroGame(pool[Math.floor(Math.random() * pool.length)]);
    }
  }, [])

  // Gamepad Polling Loop for UI Navigation
  useEffect(() => {
    // Only run UI navigation if no game is playing
    if (selectedGame) return;

    let rafId;
    const pollGamepad = () => {
      // Use originalGetGamepads if the openbor hack is active, otherwise normal
      const getPads = window.originalGetGamepads || (navigator.getGamepads ? navigator.getGamepads.bind(navigator) : () => []);
      const gamepads = getPads();
      const now = Date.now();

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && now - lastInputTime.current > INPUT_DELAY) {
          
          let moved = false;
          let newRow = focusedRow;
          let newCol = focusedCol;

          // D-Pad and Axis reading
          const up = gp.buttons[12]?.pressed || (gp.axes[1] < -0.5);
          const down = gp.buttons[13]?.pressed || (gp.axes[1] > 0.5);
          const left = gp.buttons[14]?.pressed || (gp.axes[0] < -0.5);
          const right = gp.buttons[15]?.pressed || (gp.axes[0] > 0.5);
          const actionA = gp.buttons[0]?.pressed;

          if (up) {
            newRow = Math.max(-1, focusedRow - 1);
            moved = true;
          } else if (down) {
            newRow = Math.min(categories.length - 1, focusedRow + 1);
            moved = true;
          } else if (left) {
            newCol = Math.max(0, focusedCol - 1);
            moved = true;
          } else if (right) {
            // max col depends on current row
            if (focusedRow === -1) {
              newCol = 0; // Hero only has 1 button
            } else {
              const maxCols = categories[focusedRow].games.length - 1;
              newCol = Math.min(maxCols, focusedCol + 1);
            }
            moved = true;
          }

          if (moved) {
            // Adjust col if we moved up/down to a shorter row
            if (newRow !== focusedRow && newRow >= 0) {
              const maxCols = categories[newRow].games.length - 1;
              if (newCol > maxCols) newCol = maxCols;
            } else if (newRow === -1) {
              newCol = 0;
            }

            setFocusedRow(newRow);
            setFocusedCol(newCol);
            lastInputTime.current = now;
            
            // Auto scroll window vertically
            if (newRow === -1) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              const rowElements = document.querySelectorAll('.game-row');
              if (rowElements[newRow]) {
                 rowElements[newRow].scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
            break; // Handle one gamepad
          }

          // Handle Action Button
          if (actionA && now - lastInputTime.current > 500) {
             if (focusedRow === -1 && heroGame) {
                setSelectedGame(heroGame);
             } else if (focusedRow >= 0 && categories[focusedRow]) {
                const gameToLaunch = categories[focusedRow].games[focusedCol];
                if (gameToLaunch) setSelectedGame(gameToLaunch);
             }
             lastInputTime.current = now;
             break;
          }
        }
      }
      rafId = requestAnimationFrame(pollGamepad);
    };

    rafId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(rafId);
  }, [selectedGame, focusedRow, focusedCol, categories, heroGame]);

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
              <button className={`btn-play ${focusedRow === -1 ? 'focused' : ''}`} onClick={() => setSelectedGame(heroGame)}>
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
        <GameSelection 
           categories={categories} 
           onSelectGame={setSelectedGame} 
           focusedRow={focusedRow + 1} // +1 because row 0 is hero in GameSelection mapping, wait GameSelection doesn't know about hero
           focusedCol={focusedCol}
        />
      </div>
    </div>
  )
}

export default App
