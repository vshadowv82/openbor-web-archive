import './GameCard.css'

const GameCard = ({ game, onClick }) => {
  return (
    <div className="game-card" onClick={onClick}>
      <div className="game-card-image">
        <img src={game.coverUrl} alt={game.title} />
        <div className="play-overlay">
          <svg viewBox="0 0 24 24" fill="white" width="48" height="48">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="game-card-info">
        <h3>{game.title}</h3>
      </div>
    </div>
  )
}

export default GameCard
