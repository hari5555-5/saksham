const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, run, get, all, saveDb } = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'saksham_secret_key';
const SALT_ROUNDS = 12;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, institution, educationLevel, interests, accessibilityPreferences } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

    const db = await getDb();
    const existing = get(db, 'SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    run(db, 'INSERT INTO users (name, email, password_hash, phone, institution, education_level, interests) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase(), passwordHash, phone || null, institution || 'Biotechnology Institute', educationLevel || 'Undergraduate', interests || 'Genetics, Biosensors, AI']);

    const user = get(db, 'SELECT id, name, email, institution, education_level, interests FROM users WHERE email = ?', [email.toLowerCase()]);
    const userId = user.id;

    const prefs = accessibilityPreferences || {};
    run(db, `INSERT INTO accessibility_preferences (user_id, font_size, high_contrast, dark_mode, text_to_speech, screen_reader_mode, sign_language_support, reduced_motion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, prefs.fontSize || 'medium', prefs.highContrast ? 1 : 0, prefs.darkMode ? 1 : 0,
       prefs.textToSpeech ? 1 : 0, prefs.screenReader ? 1 : 0, prefs.signLanguage ? 1 : 0, prefs.reducedMotion ? 1 : 0]);

    const token = jwt.sign({ userId, email: email.toLowerCase(), name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Account created successfully. Welcome to APD EQUILEARN!', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Could not create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const db = await getDb();
    const user = get(db, 'SELECT id, name, email, password_hash, institution, education_level, interests FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Welcome back to APD EQUILEARN!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        institution: user.institution || 'Biotechnology Institute',
        educationLevel: user.education_level || 'Undergraduate',
        interests: user.interests || 'Genetics, Biosensors, AI'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
});

module.exports = router;
