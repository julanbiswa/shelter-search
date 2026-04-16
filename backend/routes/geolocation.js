const express = require('express');
const router = express.Router();

// Calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Endpoint to calculate distance
router.post('/distance', (req, res) => {
  const { start, end } = req.body;
  if (!start || !end) {
    return res.status(400).json({ message: 'Start and end locations are required' });
  }

  const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
  res.json({ distance });
});

module.exports = router;