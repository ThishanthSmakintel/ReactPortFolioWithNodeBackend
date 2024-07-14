const express = require('express');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose'); // Commented out MongoDB
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2000;
const API_TOKEN = process.env.API_TOKEN || 'bORYDyZ4gpCaMLW3VsX';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
// const MONGODB_URI = process.env.MONGODB_URI || null; // Commented out MongoDB URI

app.use(bodyParser.json());
app.use(cors());

// // MongoDB connection setup (commented out)
// if (MONGODB_URI) {
//   mongoose.connect(MONGODB_URI)
//     .then(() => {
//       console.log('MongoDB connected');
//     })
//     .catch((err) => {
//       console.error('MongoDB connection error:', err);
//     });
// }

// // Define MongoDB schema (commented out)
// const locationSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   longitude: { type: Number, required: true },
//   latitude: { type: Number, required: true },
//   gpsAccuracy: { type: Number, required: true },
//   deviceId: { type: String, required: true },
//   updatedTime: { type: Date, default: Date.now }
// });

// const Location = MONGODB_URI ? mongoose.model('Location', locationSchema) : null;

// // Middleware to authenticate token
// const authenticateToken = (req, res, next) => {
//   const token = req.headers['authorization'];

//   if (token === API_TOKEN) {
//     next();
//   } else {
//     res.status(403).json({ error: 'Forbidden' });
//   }
// };

// // API routes dependent on MongoDB connection (commented out)
// if (Location) {
//   app.get('/api/location/getLocationData', authenticateToken, async (req, res) => {
//     try {
//       const locations = await Location.find();
//       res.json(locations);
//     } catch (error) {
//       console.error('Error fetching locations:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

//   app.post('/api/location/addLocationData', authenticateToken, async (req, res) => {
//     const { userId, longitude, latitude, gpsAccuracy, deviceId } = req.body;

//     if (!userId || !longitude || !latitude || !gpsAccuracy || !deviceId) {
//       return res.status(400).json({ error: 'All fields required' });
//     }

//     try {
//       const newLocation = new Location({
//         userId,
//         longitude,
//         latitude,
//         gpsAccuracy,
//         deviceId,
//         updatedTime: new Date()
//       });

//       const savedLocation = await newLocation.save();
//       res.status(201).json(savedLocation);
//     } catch (error) {
//       console.error('Error adding location data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
// }

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Handle unsupported routes
app.use((req, res) => {
  console.log(`Unsupported route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on ${APP_URL}`);
});
