// Gamelog App, or application to track video games backlog. Now with backend integration and full CRUD functionality!

import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'; 

// Import all the components we need from react-bootstrap, added new components
import { Container, Row, Col, Card, Form, Button, Modal, ButtonGroup, Stack } from 'react-bootstrap';

// Since I don't have a server yet, I run the backend locally on port 5001
const API_URL = 'http://localhost:5001/api/games';

// Helper function for card colors for CSS
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
      return '';
  }
};

function App() {
  // STATE MANAGEMENT
  const [games, setGames] = useState([]);

  // Form state ifor adding a new game
  const [gameName, setGameName] =useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('backlog');

  // NEW STATE for Edit Modal
  // State to control if the modal is open or closed

  const [showModal, setShowModal] = useState(false);

  // State to hold the game we are currently editing
  const [currentGame, setCurrentGame] = useState(null);
  // State to hold the data *inside* the edit form
  const [editFormData, setEditFormData] = useState({

    name: '',
    platform: '',
    status: '',

  });

  // DATA FETCHING (GET)
  // This 'useEffect' hook runs ONCE when the component first loads
  useEffect(() => {
    // sync function inside to fetch data
    const fetchGames = async () => {
      try {
        // Use axios to make a GET request to our backend
        const response = await axios.get(API_URL);
        // 'response.data' contains our list of games
        setGames(response.data);
      } catch (err) {
        // Log an error if something goes wrong
        console.error('Error fetching games:', err);
      }
    };
    fetchGames();
  }, []);

  // EVENT HANDLERS (CREATE, UPDATE, DELETE)
  // Create (POST)
  const handleAddGame = async (event) => {
    event.preventDefault();

    // 1. Create a new game object
    const newGame = {
      name: gameName,
      platform: platform,
      status: status,
    };

    try {
      // 2. Send the new game to the backend API
      // axios.post(url, data)
      const response = await axios.post(API_URL, newGame);

      // 'response.data' is the new game object *saved by the DB*
      // (it includes the _id, createdAt, etc.)
      
      // 3. Update our frontend state
      // Add the new game to the top of the list
      setGames([response.data, ...games]);
      
      // 4. Clear the form
      setGameName('');
      setPlatform('');
      setStatus('backlog');

    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  // DELETE (DELETE)
  const handleDelete = async (gameId) => {
    // Should I add a confirm box if we want (need to think)? If yes, window.confirm - a hint for future

    try {
      // Send DELETE request to /api/games/:id
      await axios.delete(`${API_URL}/${gameId}`);
    
      // Update the frontend state
      // Filter out the deleted game
      setGames(games.filter((game) => game._id !== gameId));
    } catch (err) {
      console.error('Error deleting game:', err);
    }

  };

  // UPDATE (PUT)
  // This runs when we "Save Changes" in the modal

  const handleUpdate = async (event) => {
    event.preventDefault();
    // Get the ID from the game we are editing
    const gameId = currentGame._id;
    try {

      // Send PUT request to /api/games/:id
      // The body is our 'editFormData'
      const response = await axios.put(`${API_URL}/${gameId}`, editFormData);
      // 'response.data' is the *updated* game from the server
      const updatedGame = response.data;
      // Update the 'games' array in our state
      setGames(games.map((game) => 
        // Find the game we edited...
        game._id === updatedGame._id 
          // ...and replace it with the updated version
          ? updatedGame 
          // ...otherwise, keep the old one
          : game
      ));
      handleCloseModal();
    } catch (err) {
      console.error('Error updating game:', err);
    }
  };

  // MODAL HELPER FUNCTIONS 
  // This runs when we type in the EDIT modal form

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Runs when we click the "Edit" button on a card
  const handleShowModal = (game) => {
    setCurrentGame(game); // Remember *which* game we're editing
    setEditFormData(game); // Pre-fill the modal form with that game's data
    setShowModal(true); // Open the modal
  };

  // This runs when we click "Close" or "Cancel"
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentGame(null); // Forget which game we were editing
  };

  // DATA FILTERING 
  // Filter games into 4 columns
  const backlogGames = games.filter((game) => game.status === 'backlog');
  const nextToPlayGames = games.filter((game) => game.status === 'next-to-play');
  const playingGames = games.filter((game) => game.status === 'playing');
  const completedGames = games.filter((game) => game.status === 'completed');

  // JSX RENDER
  return (
    <Container className="my-4">
      <div className="text-center mb-4">
        <h1 className="header-title">Track your gaming journey</h1>
      </div>

      {/* Add Game Form */}
      <Card className="mb-4 mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
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
      <Row>
        {/* Map over all 4 columns */}
        {/* Column: Backlog */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Backlog</h2>
          {backlogGames.map((game) => (
            <Card key={game._id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Backlog</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {/* We'll use platform here instead of description for now */}
                    {game.platform}
                </Card.Text>
              </Card.Body>
             {/* Card Footer with Buttons */}
              <Card.Footer>
                <ButtonGroup size="sm" className="w-100">
                  <Button variant="outline-dark" onClick={() => handleShowModal(game)}>Edit</Button>
                  <Button variant="outline-danger" onClick={() => handleDelete(game._id)}>Delete</Button>
                </ButtonGroup>
              </Card.Footer>
            </Card>
          ))}
        </Col>

        {/* Column: Next to Play */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Next to Play</h2>
          {nextToPlayGames.map((game) => (
            <Card key={game._id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Next to Play</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.platform}
                </Card.Text>
              </Card.Body>
               {/* Card Footer with Buttons */}

              <Card.Footer>
                <ButtonGroup size="sm" className="w-100">
                  <Button variant="outline-dark" onClick={() => handleShowModal(game)}>Edit</Button>
                  <Button variant="outline-danger" onClick={() => handleDelete(game._id)}>Delete</Button>
                </ButtonGroup>
              </Card.Footer>
            </Card>
          ))}
        </Col>

        {/* Column: Playing */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Playing</h2>
          {playingGames.map((game) => (
            <Card key={game._id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Playing</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.platform}
                </Card.Text>
              </Card.Body>
               {/* Card Footer with Buttons, probably, there is a better way to handle this instead of adding into each column */}
              <Card.Footer>
                <ButtonGroup size="sm" className="w-100">
                  <Button variant="outline-dark" onClick={() => handleShowModal(game)}>Edit</Button>
                  <Button variant="outline-danger" onClick={() => handleDelete(game._id)}>Delete</Button>
                </ButtonGroup>
              </Card.Footer>
            </Card>
          ))}
        </Col>

        {/* Column: Completed */}
        <Col md={6} lg={3} className="mb-3">
          <h2 className="column-header">Completed</h2>
          {completedGames.map((game) => (
            <Card key={game._id} className={`mb-3 ${getCardClassName(game.status)}`}>
              <Card.Body>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
                <div className="fw-bold mb-2">Completed</div>
                <Card.Title className="h6">
                    <span className="me-2">⭐</span>
                    {game.name}
                </Card.Title>
                <Card.Text className="text-muted small">
                    {game.platform}
                </Card.Text>
              </Card.Body>
                {/* Card Footer with Buttons*/}
              <Card.Footer>
                <ButtonGroup size="sm" className="w-100">
                  <Button variant="outline-dark" onClick={() => handleShowModal(game)}>Edit</Button>
                  <Button variant="outline-danger" onClick={() => handleDelete(game._id)}>Delete</Button>
                </ButtonGroup>
              </Card.Footer>
            </Card>
          ))}
        </Col>
      </Row>
      {/* Edit Game Modal */}
      {/* This component is hidden by default (show={showModal}) */}
      {currentGame && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Game</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Should use 'handleUpdate' for submission */}
            <Form onSubmit={handleUpdate}>
              <Form.Group className="mb-3" controlId="edit-game-name">
                <Form.Label>Game name</Form.Label>
                <Form.Control
                  type="text"
                  name="name" // 'name' must match the key in editFormData
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="edit-platform">
                <Form.Label>Platform</Form.Label>
                <Form.Control
                  type="text"
                  name="platform"
                  value={editFormData.platform}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="edit-status">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                >
                  <option value="backlog">Backlog</option>
                  <option value="next-to-play">Next to Play</option>
                  <option value="playing">Playing</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
              {/* Buttons at the bottom of the modal */}
              <Stack direction="horizontal" gap={2}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="ms-auto">
                  Save Changes
                </Button>
              </Stack>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
}

export default App;