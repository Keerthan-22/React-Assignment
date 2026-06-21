// File: server/app.js
// Purpose: Main Express app - configures middleware, session, and routes.

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const profileRoutes = require('./routes/profile');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - allow the Vite dev server origin. Adjust if using different port.
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Basic session store - fine for local dev. Replace in production.
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
