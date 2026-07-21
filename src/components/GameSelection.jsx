import { useMemo, useRef } from 'react'
import GameCard from './GameCard'
import './GameSelection.css'

const GameRow = ({ category, games, onSelectGame }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.8;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!games || games.length === 0) return null;

  return (
    <div className="game-row">
      <h2 className="row-title">{category}</h2>
      <div className="row-container">
        <button className="slider-btn left" onClick={() => scroll('left')}>&#8249;</button>
        <div className="row-posters" ref={rowRef}>
          {games.map((game, index) => (
            <GameCard key={game.id || index} game={game} onClick={() => onSelectGame(game)} />
          ))}
        </div>
        <button className="slider-btn right" onClick={() => scroll('right')}>&#8250;</button>
      </div>
    </div>
  );
};

const GameSelection = ({ games, onSelectGame }) => {
  // Group games by category
  const categories = useMemo(() => {
    const grouped = {};
    games.forEach(game => {
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
  }, [games]);

  return (
    <div className="game-selection">
      {categories.map(cat => (
        <GameRow 
          key={cat.name} 
          category={cat.name} 
          games={cat.games} 
          onSelectGame={onSelectGame} 
        />
      ))}
    </div>
  )
}

export default GameSelection
