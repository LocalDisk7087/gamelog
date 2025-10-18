// Gamelog App - Main Component
// Handles all application state and renders the UI

import { useState } from 'react';
import './App.css';

// Initial data to populate the list on first load
// This will be replaced by a backend API call later.
const initialGames = [
  {
    id: 1,
    name: 'Gears of War',
    platform: '♦ A',
    description: 'Menu description.',
    status: 'backlog',
  },
  {
    id: 2,
    name: 'Halo',
    platform: '♦ A',
    description: 'Menu description.',
    status: 'next-to-play',
  },
  {
    id: 3,
    name: 'Dead Space',
    platform: '♦ A',
    description: 'Menu description.',
    status: 'playing',
  },
  {
    id: 4,
    name: 'Warcraft 3',
    platform: '♦ A',
    description: 'Menu description.',
    status: 'completed',
  },
];

function App() {
  // === STATE MANAGEMENT ===
  // State for the main list of games
  const [games, setGames] = useState(initialGames);

  // State for the controlled form inputs
  const [gameName, setGameName] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('backlog'); // Default to 'backlog'

  // === EVENT HANDLERS ===
  // Handles the submission of the "Add New Game" form
  const handleAddGame = (event) => {
    // Prevent the default form submission (which causes a page reload)
    event.preventDefault();

    // Create a new game object from the form's state
    const newGame = {
      id: Date.now(), // Use timestamp as a simple unique ID for now
      name: gameName,
      platform: platform,
      description: 'New game description.', // Placeholder description
      status: status,
    };

    // Update the games list state, adding the new game to the top
    setGames([newGame, ...games]);

    // Reset the form fields to be empty
    setGameName('');
    setPlatform('');
    setStatus('backlog');
  };

  // === DATA FILTERING ===
  // Filter the main games list into separate arrays for each column
  // This makes rendering the columns much cleaner.
  const backlogGames = games.filter((game) => game.status === 'backlog');
  const nextToPlayGames = games.filter((game) => game.status === 'next-to-play');
  const playingGames = games.filter((game) => game.status === 'playing');
  const completedGames = games.filter((game) => game.status === 'completed');

  // === JSX RENDER ===
  return (
    <div className="container">
      <div className="header">
        <h1>My Gamelog</h1>
      </div>

      {/* --- Add Game Form --- */}
      <div className="form-container" style={{ display: 'block' }}>
        <form onSubmit={handleAddGame}>
          <div className="form-group">
            <label htmlFor="game-name">Game name</label>
            <input
              type="text"
              id="game-name"
              placeholder="e.g., Cyberpunk 2077"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <input
              type="text"
              id="platform"
              placeholder="e.g., PC, PS5"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="backlog">Backlog</option>
              <option value="next-to-play">Next to Play</option>
              <option value="playing">Playing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Add to Gamelog
          </button>
        </form>
      </div>

      {/* --- Game Grid (Dynamically Rendered) --- */}
      <div className="games-grid">
        {/* Backlog Column */}
        <div className="game-column">
          <h2>Backlog</h2>
          {backlogGames.map((game) => (
            <div key={game.id} className="game-card backlog">
              <div className="game-status">Status</div>
              <div className="game-status-value">Backlog</div>
              <div className="game-title">
                <span className="game-title-icon">⭐</span>
                <span className="game-title-text">{game.name}</span>
              </div>
              <div className="game-description">{game.description}</div>
              <div className="game-platform">{game.platform}</div>
            </div>
          ))}
        </div>

        {/* Next to Play Column */}
        <div className="game-column">
          <h2>Next to Play</h2>
          {nextToPlayGames.map((game) => (
            <div key={game.id} className="game-card next-to-play">
              <div className="game-status">Status</div>
              <div className="game-status-value">Next to Play</div>
              <div className="game-title">
                <span className="game-title-icon">⭐</span>
                <span className="game-title-text">{game.name}</span>
              </div>
              <div className="game-description">{game.description}</div>
              <div className="game-platform">{game.platform}</div>
            </div>
          ))}
        </div>

        {/* Playing Column */}
        <div className="game-column">
          <h2>Playing</h2>
          {playingGames.map((game) => (
            <div key={game.id} className="game-card playing">
              <div className="game-status">Status</div>
              <div className="game-status-value">Playing</div>
              <div className="game-title">
                <span className="game-title-icon">⭐</span>
                <span className="game-title-text">{game.name}</span>
              </div>
              <div className="game-description">{game.description}</div>
              <div className="game-platform">{game.platform}</div>
            </div>
          ))}
        </div>

        {/* Completed Column */}
        <div className="game-column">
          <h2>Completed</h2>
          {completedGames.map((game) => (
            <div key={game.id} className="game-card completed">
              <div className="game-status">Status</div>
              <div className="game-status-value">Completed</div>
              <div className="game-title">
                <span className="game-title-icon">⭐</span>
                <span className="game-title-text">{game.name}</span>
              </div>
              <div className="game-description">{game.description}</div>
              <div className="game-platform">{game.platform}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;