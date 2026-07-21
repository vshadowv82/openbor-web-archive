import { useEffect, useRef } from 'react'
import GameCard from './GameCard'
import './GameSelection.css'

const GameRow = ({ category, games, onSelectGame, isFocusedRow, focusedCol }) => {
  const rowRef = useRef(null);

  useEffect(() => {
    if (isFocusedRow && rowRef.current) {
      const activeCard = rowRef.current.children[focusedCol];
      if (activeCard && activeCard.scrollIntoView) {
        // Scroll the horizontal row to bring the card into view smoothly
        activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [isFocusedRow, focusedCol]);

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
    <div className={`game-row ${isFocusedRow ? 'focused-row' : ''}`}>
      <h2 className="row-title">{category}</h2>
      <div className="row-container">
        <button className="slider-btn left" onClick={() => scroll('left')}>&#8249;</button>
        <div className="row-posters" ref={rowRef}>
          {games.map((game, index) => (
            <GameCard 
              key={game.id || index} 
              game={game} 
              onClick={() => onSelectGame(game)} 
              isFocused={isFocusedRow && focusedCol === index}
            />
          ))}
        </div>
        <button className="slider-btn right" onClick={() => scroll('right')}>&#8250;</button>
      </div>
    </div>
  );
};

const GameSelection = ({ categories, onSelectGame, focusedRow, focusedCol }) => {
  return (
    <div className="game-selection">
      {categories.map((cat, rowIndex) => (
        <GameRow 
          key={cat.name} 
          category={cat.name} 
          games={cat.games} 
          onSelectGame={onSelectGame} 
          isFocusedRow={focusedRow === rowIndex + 1}
          focusedCol={focusedCol}
        />
      ))}
    </div>
  )
}

export default GameSelection
