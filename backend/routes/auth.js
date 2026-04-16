const express = require('express');
const router = express.Router();

// Mock user database
let users = [];

// Helper to find user by email (case-insensitive)
const findUserByEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === normalizedEmail);
};

// Login route
router.post('/login', (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    
    console.log('Login attempt with email:', email);
    console.log('Available users:', users.map(u => ({ id: u.id, email: u.email })));
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = findUserByEmail(email);
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (user.password !== password) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Login successful for:', email);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Register route
router.post('/register', (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const phone = req.body.phone?.trim();
    const password = req.body.password?.trim();
    
    console.log('Register attempt with email:', email);
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    if (findUserByEmail(email)) {
      console.log('Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email,
      phone: phone || '',
      password
    };
    
    users.push(newUser);
    console.log('User registered successfully:', email);
    console.log('Total users:', users.length);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get current user route
router.get('/current-user', (req, res) => {
  try {
    // In a real app, this would check the JWT token from headers
    // For now, return null since we don't have session management
    res.json(null);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    // In a real app, this would invalidate the JWT token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update profile route
router.put('/update-profile/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email, phone } = req.body;
    
    if (email && email !== user.email && findUserByEmail(email)) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;