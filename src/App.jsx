// Gamelog App, or application to track video games backlog
// I've adjusted it to use react-bootstrap components for better styling

import { useState } from 'react';
import './App.css';

// Import all the components we need from react-bootstrap
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

// Initial data, later it will come from the API (backend)
const initialGames = [
  {
    id: 1,
    name: 'Gears of War',
    platform: '♦ PC',
    description: 'Game description',
    status: 'backlog',
  },
  {
    id: 2,
    name: 'Halo',
    platform: '♦ Xbox Series X',
    description: 'Game description',
    status: 'next-to-play',
  },
  {
    id: 3,
    name: 'Dead Space',
    platform: '♦ PC',
    description: 'Game description',
    status: 'playing',
  },
  {
    id: 4,
    name: 'Warcraft 3',
    platform: '♦ PC',
    description: 'Game description',
    status: 'completed',
  },
];

// A small helper function to get the right CSS class for card colors
const getCardClassName = (status) => {
  switch (status) {
    case 'backlog':
      return 'card-backlog';
    case 'next-to-play':
      return 'card-next-to-play';
    case 'playing':
      return 'card-playing';
    case 'completed':
      return 'card-completed';
    default:
      return ''; // default class
  }
};


function App() {
  // STATE MANAGEMENT
  // The list of games
  const [games, setGames] = useState(initialGames);

  // State for the form inputs
  const [gameName, setGameName] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('backlog'); // default to 'backlog'

  // EVENT HANDLERS
  // This function runs when the form is submitted
  const handleAddGame = (event) => {
    // prevent page reload
    event.preventDefault();

    // Create a new game object
    const newGame = {
      id: Date.now(), // temporary id
      name: gameName,
      platform: platform,
      description: 'New game description.', // just a placeholder for now
      status: status,
    };

    // Update the games list in the state
    setGames([newGame, ...games]);
    
    // Clear the form inputs
    setGameName('');
    setPlatform('');
    setStatus('backlog');
  };

  // DATA FILTERING
  // Filter games into 4 columns
  const backlogGames = games.filter((game) => game.status === 'backlog');
  const nextToPlayGames = games.filter((game) => game.status === 'next-to-play');
  const playingGames = games.filter((game) => game.status === 'playing');
  const completedGames = games.filter((game) => game.status === 'completed');

  // JSX RENDER
  return (
    // <Container> is the main bootstrap div, it centers content (need remove this comment later)
    <Container className="my-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="header-title">Track your gaming journey</h1>
      </div>

      {/* --- Add Game Form --- */}
      <Card className="mb-4 mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
          {/* react-bootstrap Form */}
          <Form onSubmit={handleAddGame}>
            <Form.Group className="mb-3" controlId="game-name">
              <Form.Label>Game name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Cyberpunk 2077"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="platform">
              <Form.Label>Platform</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., PC, PS5"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="backlog">Backlog</option>
                <option value="next-to-play">Next to Play</option>
                <option value="playing">Playing</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            
            <Button variant="dark" type="submit" className="w-100">
              Add to Gamelog
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* --- Games Grid --- */}
      {/* Use <Row> and <Col> to create the grid */}
      <Row>
        {/* Column: Backlog */}
        {/* lg={3} means 4 cols on large screens, md={6} means 2 on medium (remove later this note) */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Backlog</h2>
          {backlogGames.map((game) => (
            // Wrap each game in a <Card>
            <Card key={game.id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                {/* Use bootstrap utility classes to style text */}
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Backlog</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.description}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted small">
                {game.platform}
              </Card.Footer>
            </Card>
          ))}
        </Col>

        {/* Column: Next to Play */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Next to Play</h2>
          {nextToPlayGames.map((game) => (
            <Card key={game.id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Next to Play</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.description}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted small">
                {game.platform}
              </Card.Footer>
            </Card>
          ))}
        </Col>

        {/* Column: Playing */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Playing</h2>
          {playingGames.map((game) => (
            <Card key={game.id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Playing</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.description}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted small">
                {game.platform}
              </Card.Footer>
            </Card>
          ))}
        </Col>

        {/* Column: Completed */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Completed</h2>
          {completedGames.map((game) => (
            <Card key={game.id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Completed</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.description}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="text-muted small">
                {game.platform}
              </Card.Footer>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default App;