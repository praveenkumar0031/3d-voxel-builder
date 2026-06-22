require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const scenesRoutes = require('./routes/scenes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Built-in body parsers
// Adjust limit to 10MB to accommodate base64 thumbnails of voxel scenes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cookie Parser for HTTP-only JWT refresh tokens
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/scenes', scenesRoutes);

// Catch 404 routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler middleware
app.use(errorHandler);

// Start server listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
