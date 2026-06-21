// File: server/controllers/profileController.js
// Purpose: Handle profile retrieval and creation.

const pool = require('../config/db');

// Helper: basic email validation
function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

// GET /api/profile
// Returns the first profile record if present.
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles LIMIT 1');
    if (rows.length === 0) {
      return res.json({ profile: null });
    }
    // store profile id in session for convenience
    req.session.profileId = rows[0].id;
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// POST /api/profile
// Create a profile; validates required fields and uniqueness.
exports.createProfile = async (req, res) => {
  const { full_name, designation, employee_id, email, phone } = req.body;

  if (!full_name || !designation || !employee_id || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // check duplicate employee_id or email
    const [existing] = await pool.query(
      'SELECT id FROM profiles WHERE employee_id = ? OR email = ? LIMIT 1',
      [employee_id, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Employee ID or email already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO profiles (full_name, designation, employee_id, email, phone) VALUES (?, ?, ?, ?, ?)',
      [full_name, designation, employee_id, email, phone]
    );

    const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [result.insertId]);
    req.session.profileId = result.insertId;
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};
