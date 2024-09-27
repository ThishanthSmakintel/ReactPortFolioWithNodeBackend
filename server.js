const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const socketIo = require('socket.io');
require('dotenv').config();

// Initialize the Express application
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Initialize Socket.IO with HTTP server

// Configuration
const PORT = process.env.PORT || 2000;
const API_TOKEN = process.env.API_TOKEN || 'bORYDyZ4gpCaMLW3VsX';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27016/mydatabase';

// Middleware setup
app.use(bodyParser.json());

// Custom CORS Middleware for API routes
const apiCorsMiddleware = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
  next();
};

app.use(apiCorsMiddleware);

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Mongoose schema and model
const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  gpsAccuracy: { type: Number, required: true },
  deviceId: { type: String, required: true },
  updatedTime: { type: Date, default: Date.now },
  speed: { type: Number },
  movementStatus: { type: String },
});

const Location = mongoose.model('Location', locationSchema);

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === API_TOKEN) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// API endpoints
app.get('/api/location/getLocationData', authenticateToken, async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/api/location/addLocationData', authenticateToken, async (req, res) => {
  const { userId, longitude, latitude, gpsAccuracy, deviceId, speed, movementStatus } = req.body;

  if (!userId || !longitude || !latitude || !gpsAccuracy || !deviceId) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  try {
    const newLocation = new Location({ userId, longitude, latitude, gpsAccuracy, deviceId, updatedTime: new Date(), speed, movementStatus });
    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error('Error adding location data:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Serve static files from the 'dist' directory (default output for Parcel)
app.use(express.static(path.join(__dirname, 'dist')));

// Route all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// WebSocket authentication and connection
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token === API_TOKEN) {
    next();
  } else {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('New WebSocket client connected');

  socket.on('locationUpdate', async (data) => {
    console.log('Received location update:', data);

    try {
      const newLocation = new Location(data);
      await newLocation.save();
      io.emit('locationUpdated', newLocation);
    } catch (error) {
      console.error('Error saving location data:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start the server on port 2000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
