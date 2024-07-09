const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Add cors package
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2000;
const API_TOKEN = process.env.API_TOKEN || 'bORYDyZ4gpCaMLW3VsX';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:vpsThishanth%231G@198.23.149.30:27017/?directConnection=true&authSource=admin&appName=mongosh%202.2.10';

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  gpsAccuracy: { type: Number, required: true },
  deviceId: { type: String, required: true },
  updatedTime: { type: Date, default: Date.now }
});

const Location = mongoose.model('Location', locationSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (token === API_TOKEN) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

app.get('/api/location/getLocationData', authenticateToken, async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/location/addLocationData', authenticateToken, async (req, res) => {
  const { userId, longitude, latitude, gpsAccuracy, deviceId } = req.body;

  if (!userId || !longitude || !latitude || !gpsAccuracy || !deviceId) {
    return res.status(400).json({ error: 'All fields required' });
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

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((req, res) => {
  console.log(`Unsupported route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on ${APP_URL}`);
});
