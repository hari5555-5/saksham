const express = require('express');
const { getDb, run, get } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile
router.get('/', authenticateToken, async (req, res) => {
  const db = await getDb();
  const user = get(db, 'SELECT id, name, email, phone, created_at FROM users WHERE id = ?', [req.user.userId]);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const prefs = get(db, 'SELECT * FROM accessibility_preferences WHERE user_id = ?', [req.user.userId]);
  res.json({ user, preferences: prefs || {} });
});

// PUT /api/profile/preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  const db = await getDb();
  const { fontSize, highContrast, darkMode, textToSpeech, speechSpeed, screenReaderMode, signLanguageSupport, reducedMotion, lineSpacing, letterSpacing } = req.body;

  const existing = get(db, 'SELECT id FROM accessibility_preferences WHERE user_id = ?', [req.user.userId]);

  if (existing) {
    run(db, `UPDATE accessibility_preferences SET
      font_size=?, high_contrast=?, dark_mode=?, text_to_speech=?,
      speech_speed=?, screen_reader_mode=?, sign_language_support=?,
      reduced_motion=?, line_spacing=?, letter_spacing=?
      WHERE user_id=?`,
      [fontSize || 'medium', highContrast ? 1 : 0, darkMode ? 1 : 0, textToSpeech ? 1 : 0,
       speechSpeed || 1.0, screenReaderMode ? 1 : 0, signLanguageSupport ? 1 : 0,
       reducedMotion ? 1 : 0, lineSpacing || 'normal', letterSpacing || 'normal', req.user.userId]);
  } else {
    run(db, `INSERT INTO accessibility_preferences
      (user_id, font_size, high_contrast, dark_mode, text_to_speech, speech_speed, screen_reader_mode, sign_language_support, reduced_motion, line_spacing, letter_spacing)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, fontSize || 'medium', highContrast ? 1 : 0, darkMode ? 1 : 0,
       textToSpeech ? 1 : 0, speechSpeed || 1.0, screenReaderMode ? 1 : 0,
       signLanguageSupport ? 1 : 0, reducedMotion ? 1 : 0, lineSpacing || 'normal', letterSpacing || 'normal']);
  }

  res.json({ message: 'Accessibility preferences saved successfully.' });
});

module.exports = router;
