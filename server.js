const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2000;
const API_TOKEN = process.env.API_TOKEN || 'bORYDyZ4gpCaMLW3VsX';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:vpsThishanth%231G@198.23.149.30:27017/?directConnection=true&authSource=admin&appName=mongosh%202.2.10';

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connection successful');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process on connection error
});

// Define Mongoose schema
const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  gpsAccuracy: { type: Number, required: true },
  deviceId: { type: String, required: true },
  updatedTime: { type: Date, default: Date.now }
});

// Define Mongoose model
const Location = mongoose.model('Location', locationSchema);

// Middleware to check API token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (token === API_TOKEN) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Example GET route for /api/location/getLocationData
app.get('/api/location/getLocationData', authenticateToken, async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Example POST route for /api/location/addLocationData
app.post('/api/location/addLocationData', authenticateToken, async (req, res) => {
  const { userId, longitude, latitude, gpsAccuracy, deviceId } = req.body;

  if (!userId || !longitude || !latitude || !gpsAccuracy || !deviceId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newLocation = new Location({
      userId,
      longitude,
      latitude,
      gpsAccuracy,
      deviceId,
      updatedTime: new Date()
    });

    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error('Error adding location data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files from the 'build' directory for production
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to serving 'index.html' for any other route to handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling for unsupported routes
app.use((req, res) => {
  console.log(`Unsupported route accessed: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${APP_URL}`);
});
