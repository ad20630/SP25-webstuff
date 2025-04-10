/**
 * Serves as the web servers main entrypoint
 * 
 * Created By: Chris Morgan
 */

//#region imports
import type { Express, Request, Response, NextFunction } from 'express-serve-static-core';
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { authRouter } = require('./auth/authRouter');
//#endregion

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS for development
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Root route handler
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Mount auth router
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
