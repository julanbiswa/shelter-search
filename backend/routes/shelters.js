const express = require('express');
const router = express.Router();

// Mock data - now using rooms instead of shelters
let rooms = [];

// Get all rooms
router.get('/', (req, res) => {
  try {
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get all rooms for a specific owner
router.get('/owner/:ownerId', (req, res) => {
  try {
    const ownerId = parseInt(req.params.ownerId);
    const ownerRooms = rooms.filter(r => r.ownerId === ownerId);
    res.json(ownerRooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get a single room by ID
router.get('/:id', (req, res) => {
  try {
    const room = rooms.find(r => r.id === parseInt(req.params.id));
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Create a new room
router.post('/', (req, res) => {
  try {
    const newRoom = {
      id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update a room
router.put('/:id', (req, res) => {
  try {
    const index = rooms.findIndex(r => r.id === parseInt(req.params.id));
    if (index !== -1) {
      rooms[index] = { ...rooms[index], ...req.body };
      res.json(rooms[index]);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete a room
router.delete('/:id', (req, res) => {
  try {
    const initialLength = rooms.length;
    rooms = rooms.filter(r => r.id !== parseInt(req.params.id));
    if (rooms.length < initialLength) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;