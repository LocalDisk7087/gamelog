// Gamelog App, or application to track video games backlog. Now with backend integration and full CRUD functionality!
// A side note: it's getting complex and complex, need to find a way rewrite modals

import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios'; 

// Import all the components we need from react-bootstrap, added new components
import { Container, Row, Col, Card, Form, Button, Modal, ButtonGroup, Stack } from 'react-bootstrap';

// Since I don't have a server yet, I run the backend locally on port 5001
const API_BASE_URL = 'https://be-for-gamelog.onrender.com/';
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
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('backlog');

  // Status for Add form's file
  const [coverImageFile, setCoverImageFile] = useState(null);

  // STATE for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  // State to hold the data *inside* the edit form
  const [editFormData, setEditFormData] = useState({

    name: '',
    platform: '',
    status: '',

  });

  // State for Edit form's file
  const [editCoverImageFile, setEditCoverImageFile] = useState(null);

  // State for ADD Modal
  // This will control "Add Game" popup
  const [showAddModal, setShowAddModal] = useState(false);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCoverImageFile(null); // Clear file on close
  };
  const handleShowAddModal = () => setShowAddModal(true);

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
      // 5. Update the 'games'
      setGames(games.map((game) => 
        game._id === updatedGame._id 
          ? updatedGame 
          : game
      ));
      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating game:', err);
    }
  };

  // Modal Helper Functions
  // EDIT MODAL HELPER FUNCTIONS 

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Runs when we click the "Edit" button on a card
  const handleShowEditModal = (game) => {
    setCurrentGame(game); 
    setEditFormData(game); 
    setShowEditModal(true); 
  };

  // This runs when we click "Close" or "Cancel"
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentGame(null);
    setEditCoverImageFile(null); // Clear file on close
  };

  // File input change handlers
 const handleAddFileChange = (event) => {
    setCoverImageFile(event.target.files[0]);
  };
  const handleEditFileChange = (event) => {
    setEditCoverImageFile(event.target.files[0]);
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
        {/* Header */}
      {/* Time to replace the old <h1> with a Button */}
      <Stack direction="horizontal" className="mb-4">
        <div>{/* Empty div pushes the button to the right */}</div>
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
                    // We build the full URL to our backend
                    src={`${API_BASE_URL}${game.coverImage}`} 
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

 {/* Add Game Modal /}
      {/* Add Game form is in this Modal now */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add a New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           {/* IMPORTANT (!): 'onSubmit' now runs 'handleAddGame' */}
          <Form onSubmit={handleAddGame}>
            <Form.Group className="mb-3" controlId="game-name">
              <Form.Label>Game name</Form.Label>
               <Form.Control type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="platform">
              <Form.Label>Platform</Form.Label>
               <Form.Control type="text" value={platform} onChange={(e) => setPlatform(e.target.value)} required />
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
            
            {/* File Input Field */}
            <Form.Group className="mb-3" controlId="cover-image">
              <Form.Label>Cover Image (Optional)</Form.Label>
              <Form.Control 
                type="file" 
                name="coverImage"
                onChange={handleAddFileChange} // Set the file state
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
              <Form.Group className="mb-3" controlId="edit-game-name">
                <Form.Label>Game name</Form.Label>
                <Form.Control type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="edit-platform">
                <Form.Label>Platform</Form.Label>
                <Form.Control type="text" name="platform" value={editFormData.platform} onChange={handleEditFormChange} required />
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
               {/*  File Input Field */}
              <Form.Group className="mb-3" controlId="edit-cover-image">
                <Form.Label>Change Cover Image (Optional)</Form.Label>
                <Form.Control 
                  type="file" 
                  name="coverImage"
                  onChange={handleEditFileChange} // Set the file state
                />
              </Form.Group>
              {/* Buttons at the bottom of the modal */}
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
    </Container>
  );
}

export default App;