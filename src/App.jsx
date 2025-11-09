// Gamelog App, or application to track video games backlog. Now with backend integration and full CRUD functionality!
// A side note: it's getting complex and complex, need to find a way rewrite modals

import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'; 

// Import all the components we need from react-bootstrap, added new components
import { Container, Row, Col, Card, Form, Button, Modal, ButtonGroup, Stack, Navbar, Nav, Toast, ToastContainer } from 'react-bootstrap';

// Now we have BE URL defined here (Render.com)
const API_BASE_URL = 'https://be-for-gamelog.onrender.com';
// Second URL os for games API
const API_GAMES_URL = `${API_BASE_URL}/api/games`;

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

  // Form state for adding a new game
  const [gameName, setGameName] = useState('');
  const [platform, setPlatform] = useState('PC');
  const [status, setStatus] = useState('backlog');

  // Status for Add form's file
  const [coverImageFile, setCoverImageFile] = useState(null);

  // STATE for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  // State to hold the data *inside* the edit form
  const [editFormData, setEditFormData] = useState({
    name: '',
    platform: 'PC',
    status: '',
  });

  // State for Edit form's file
  const [editCoverImageFile, setEditCoverImageFile] = useState(null);

  // State for ADD Modal
  // This will control "Add Game" popup
  const [showAddModal, setShowAddModal] = useState(false);
  // Stats for About and Login modals
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);

  // Helper functions for Modals
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCoverImageFile(null); // Clear file on close
  };
  const handleShowAddModal = () => setShowAddModal(true);
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  const handleShowEditModal = (game) => {
    setCurrentGame(game);
    setEditFormData(game);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentGame(null);
    setEditCoverImageFile(null);
  };
  // Helper functions for File Inputs
  const handleAddFileChange = (event) => {
    setCoverImageFile(event.target.files[0]);
  };
  const handleEditFileChange = (event) => {
    setEditCoverImageFile(event.target.files[0]);
  };

  // DATA FETCHING (GET)
  // This 'useEffect' hook runs ONCE when the component first loads
  useEffect(() => {
    // sync function inside to fetch data
    const fetchGames = async () => {
      try {
        // Use axios to make a GET request to our backend
        const response = await axios.get(API_GAMES_URL);
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

    // 1. Use FormData to send files
    const formData = new FormData();
    // 2. Add all out text data
    formData.append('name', gameName);
    formData.append('platform', platform);
    formData.append('status', status);
    // 3. Add the file, if there is one
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    try {
      // 4. Send the 'formData' object, not a regular JSON 
      const response = await axios.post(API_GAMES_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setGames([response.data, ...games]); // Add new game to the top of the list
    
      // 5. Clear the form
      setGameName('');
      setPlatform('');
      setStatus('backlog');
      setCoverImageFile(null); // Clear file input
      // Close the modal after adding
      handleCloseAddModal();
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  // DELETE (DELETE)
  const handleDelete = async (gameId) => {
    // Should I add a confirm box if we want (need to think)? If yes, window.confirm - a hint for future

    try {
      // Send DELETE request to /api/games/:id
      await axios.delete(`${API_GAMES_URL}/${gameId}`);
    
      // Update the frontend state
      // Filter out the deleted game
      setGames(games.filter((game) => game._id !== gameId));
    } catch (err) {
      console.error('Error deleting game:', err);
    }
  };

  // UPDATE (PUT)
  const handleUpdate = async (event) => {
    event.preventDefault();
    // Get the ID from the game we are editing
    const gameId = currentGame._id;
    // 1. Use FormData
    const formData = new FormData();
    // 2. Add text data
    formData.append('name', editFormData.name);
    formData.append('platform', editFormData.platform);
    formData.append('status', editFormData.status);
    // 3. Add file if there is one and it's selected (!)
    if (editCoverImageFile) {
      formData.append('coverImage', editCoverImageFile);
    }

    try {
      // 4. Send the 'formData'
      const response = await axios.put(`${API_GAMES_URL}/${gameId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedGame = response.data;
      
      // Find and replace the game in state
      setGames(games.map((game) => game._id === updatedGame._id ? updatedGame : game));
      handleCloseEditModal(); // Close modal
    } catch (err) {
      console.error('Error updating game:', err);
    }
  };

  // Remove Cover Image handler
  const handleRemoveImage = async () => {
    const gameId = currentGame._id;
    try {
      const response = await axios.put(`${API_GAMES_URL}/${gameId}/remove-image`);
      const updatedGame = response.data; // no coverImage
      setGames(games.map((game) => 
        game._id === updatedGame._id ? updatedGame : game
      ));
      handleCloseEditModal();
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  // DATA FILTERING 
  // Filter games into 4 columns
  const backlogGames = games.filter((game) => game.status === 'backlog');
  const nextToPlayGames = games.filter((game) => game.status === 'next-to-play');
  const playingGames = games.filter((game) => game.status === 'playing');
  const completedGames = games.filter((game) => game.status === 'completed');

  // JSX RENDER
  return (
    <div className="app-layout">
      {/* Header*/}
      <Navbar variant="dark" className="app-header">
        <Container fluid>
          {/* We use href="#" so it doesn't reload the page */}
          <Navbar.Brand href="#" className="header-title-text">Gamelog App</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-light" size="sm" onClick={() => setShowAboutModal(true)} className="me-2">
              About
            </Button>
            <Button variant="outline-light" size="sm" onClick={() => setShowLoginToast(true)}>
              Login
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Main App Content */}
      <Container className="my-4">
        {/* "Add Game" Button */}
        <Stack direction="horizontal" className="mb-4">
          <div></div>
          <Button 
            variant="light" 
            onClick={handleShowAddModal} 
            className="ms-auto"
          >
            Add a new game
          </Button>
        </Stack>

        {/* Games Grid */}
        <Row>
          {/* We map over all 4 columns */}
          {[backlogGames, nextToPlayGames, playingGames, completedGames].map((list, index) => (
            // Get column title based on index
            <Col md={6} lg={3} className="mb-3" key={index}>
              <h2 className="column-header">
                {['Backlog', 'Next to Play', 'Playing', 'Completed'][index]}
              </h2>
              {list.map((game) => (
                <Card key={game._id} className={`mb-3 ${getCardClassName(game.status)}`}>
                  {/* Display the cover image */}
                  {/* Check if 'game.coverImage' exists */}
                  {game.coverImage && (
                    <Card.Img 
                      variant="top" 
                      // Full URL to the image
                      src={game.coverImage}
                      className="card-img-top-custom"
                      style={{ maxHeight: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title className="h6">
                      {game.name}
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      {game.platform}
                    </Card.Text>
                  </Card.Body>
                  {/* Card Footer */}
                  <Card.Footer>
                    <ButtonGroup size="sm" className="w-100">
                      <Button variant="outline-dark" onClick={() => handleShowEditModal(game)}>Edit</Button>
                      <Button variant="outline-danger" onClick={() => handleDelete(game._id)}>Delete</Button>
                    </ButtonGroup>
                  </Card.Footer>
                </Card>
              ))}
            </Col>
          ))}
        </Row>
      </Container>

      {/* Footer */}
      <footer className="app-footer">
        Mikita Tsybulka, 2025 
      </footer>

      {/* Add Game Modal */}
      {/* Add Game form is in this Modal now */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add a New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* IMPORTANT (!): 'onSubmit' now runs 'handleAddGame' */}
          <Form onSubmit={handleAddGame}>
            <Form.Group className="mb-3">
              <Form.Label>Game name</Form.Label>
              <Form.Control 
                type="text" 
                value={gameName} 
                onChange={(e) => setGameName(e.target.value)} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Platform</Form.Label>
              <Form.Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="PC">PC</option>
                <option value="Xbox Series S/X">Xbox Series S/X</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="Android">Android</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="backlog">Backlog</option>
                <option value="next-to-play">Next to Play</option>
                <option value="playing">Playing</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cover Image (Optional)</Form.Label>
              <Form.Control 
                type="file" 
                name="coverImage" 
                onChange={handleAddFileChange} 
              />
            </Form.Group>
            <Button variant="dark" type="submit" className="w-100">
              Add to Gamelog
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Game Modal */}
      {currentGame && (
        <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Game</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Should use 'handleUpdate' for submission */}
            <Form onSubmit={handleUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Game name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleEditFormChange} 
                  required 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Platform</Form.Label>
                <Form.Select 
                  name="platform" 
                  value={editFormData.platform} 
                  onChange={handleEditFormChange}
                >
                  <option value="PC">PC</option>
                  <option value="Xbox Series S/X">Xbox Series S/X</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="Android">Android</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
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
              <Form.Group className="mb-3">
                <Form.Label>Change Cover Image (Optional)</Form.Label>
                <Form.Control 
                  type="file" 
                  name="coverImage" 
                  onChange={handleEditFileChange} 
                />
              </Form.Group>
              {currentGame.coverImage && (
                <Form.Group className="mb-3">
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleRemoveImage}
                    type="button" // button' to prevent form submission
                  >
                    Remove Current Image
                  </Button>
                </Form.Group>
              )}
              <Stack direction="horizontal" gap={2}>
                <Button variant="secondary" onClick={handleCloseEditModal}>
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

      {/* About Modal */}
      <Modal show={showAboutModal} onHide={() => setShowAboutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>About Gamelog App</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This is a course project for ITMD 504 - Programing and Application Foundations</p>
          <p>Created by: <strong>Mikita Tsybulka</strong>.</p>
          <p>
            For any questions, please contact:<br />
            <a href="mailto:mtsybulka@hawk.illinoistech.edu">mtsybulka@hawk.illinoistech.edu</a>
          </p>
        </Modal.Body>
      </Modal>

      {/* Login Toast */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1056 }}>
        <Toast onClose={() => setShowLoginToast(false)} show={showLoginToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Login</strong>
          </Toast.Header>
          <Toast.Body>
            Login functionality is currently in development, please try again later
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default App;