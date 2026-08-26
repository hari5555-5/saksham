const express = require('express');
const { getDb, run, get, all } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/papers
router.get('/', authenticateToken, async (req, res) => {
  const { exam, year, subject, paper_type } = req.query;
  const db = await getDb();

  let query = 'SELECT id, exam, year, subject, paper_type, title, url, source, is_demo FROM past_papers WHERE 1=1';
  const params = [];

  if (exam) { query += ' AND exam = ?'; params.push(exam.toUpperCase()); }
  if (year) { query += ' AND year = ?'; params.push(parseInt(year)); }
  if (subject && subject !== 'All') { query += ' AND subject LIKE ?'; params.push(`%${subject}%`); }
  if (paper_type) { query += ' AND paper_type = ?'; params.push(paper_type); }
  query += ' ORDER BY year DESC, exam ASC';

  try {
    const papers = all(db, query, params);
    res.json({ papers, total: papers.length });
  } catch (err) {
    console.error('Past papers error:', err);
    res.status(500).json({ error: 'Could not load past papers. Please try again.' });
  }
});

// GET /api/papers/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const db = await getDb();
  const paper = get(db, 'SELECT * FROM past_papers WHERE id = ?', [req.params.id]);
  if (!paper) return res.status(404).json({ error: 'Paper not found.' });

  try {
    paper.questions = paper.questions ? JSON.parse(paper.questions) : [];
  } catch {
    paper.questions = [];
  }
  res.json(paper);
});

module.exports = router;
