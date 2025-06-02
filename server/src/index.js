import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config/index.js';

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Import routes
import authRoutes from './routes/auth.js';
import incidentRoutes from './routes/incidents.js';
import responderRoutes from './routes/responder.js';

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Rakshak API' });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/responder', responderRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
