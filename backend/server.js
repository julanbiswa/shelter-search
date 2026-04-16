const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sheltersRoutes = require('./routes/shelters');
const authRoutes = require('./routes/auth');
const geolocationRoutes = require('./routes/geolocation');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
// Increase payload size limit to 50MB to handle image uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/shelters', sheltersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/geolocation', geolocationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});