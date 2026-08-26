const express = require('express');
const { getDb, run, get, all } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// GET /api/chat/sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  const db = await getDb();
  const sessions = all(db,
    'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50',
    [req.user.userId]);
  res.json({ sessions });
});

// POST /api/chat/sessions
router.post('/sessions', authenticateToken, async (req, res) => {
  const db = await getDb();
  run(db, 'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)', [req.user.userId, 'New Conversation']);
  const session = get(db,
    'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [req.user.userId]);
  res.status(201).json({ session });
});

// DELETE /api/chat/sessions/:id
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  const db = await getDb();
  const session = get(db, 'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  run(db, 'DELETE FROM chat_messages WHERE session_id = ?', [req.params.id]);
  run(db, 'DELETE FROM chat_sessions WHERE id = ?', [req.params.id]);
  res.json({ message: 'Conversation deleted.' });
});

// GET /api/chat/sessions/:id/messages
router.get('/sessions/:id/messages', authenticateToken, async (req, res) => {
  const db = await getDb();
  const session = get(db, 'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
  if (!session) return res.status(404).json({ error: 'Session not found.' });
  const messages = all(db,
    'SELECT id, role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
    [req.params.id]);
  res.json({ messages, session });
});

// POST /api/chat/sessions/:id/messages
router.post('/sessions/:id/messages', authenticateToken, async (req, res) => {
  const { message, mode } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  const db = await getDb();
  const session = get(db, 'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  run(db, 'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)', [req.params.id, 'user', message.trim()]);

  const history = all(db,
    'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 10',
    [req.params.id]).reverse();

  let systemPrompt;
  if (mode === 'simple') {
    systemPrompt = 'You are innoVate, an educational assistant. Use very plain language, short sentences, and real-world examples. Avoid all jargon.';
  } else if (mode === 'beginner') {
    systemPrompt = 'You are innoVate. Explain everything as if talking to a curious 10-year-old. Use fun analogies and encouraging language.';
  }

  try {
    const aiResponse = await aiService.chat(history, systemPrompt);
    run(db, 'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)', [req.params.id, 'assistant', aiResponse]);

    // Update session title from first message
    if (session.title === 'New Conversation') {
      const title = message.trim().substring(0, 50) + (message.length > 50 ? '...' : '');
      run(db, "UPDATE chat_sessions SET title = ?, updated_at = datetime('now') WHERE id = ?", [title, req.params.id]);
    } else {
      run(db, "UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?", [req.params.id]);
    }

    const isDemo = !process.env.OPENAI_API_KEY;
    res.json({ response: aiResponse, isDemo });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'innoVate is temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
