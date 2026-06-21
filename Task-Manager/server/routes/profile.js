// File: server/routes/profile.js
// Purpose: Define profile-related routes (GET, POST)

const express = require('express');
const router = express.Router();
const controller = require('../controllers/profileController');

// GET /api/profile - return existing profile if any
router.get('/', controller.getProfile);

// POST /api/profile - create profile
router.post('/', controller.createProfile);

module.exports = router;
