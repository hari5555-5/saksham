const express = require('express');
const { searchOpenAlex, getOpenAlexPaper, DEMO_PAPERS } = require('../services/researchService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/research/search
router.get('/search', authenticateToken, async (req, res) => {
  const { q, year, sort } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter a search term (at least 2 characters).' });
  }

  try {
    const results = await searchOpenAlex(q.trim(), { year, sort });
    res.json({ results, source: 'OpenAlex', total: results.length });
  } catch (err) {
    console.error('Research search error:', err.message);
    // Fallback to demo data
    const query = q.toLowerCase();
    const filtered = DEMO_PAPERS.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.abstract.toLowerCase().includes(query) ||
      p.keywords.toLowerCase().includes(query)
    );
    res.json({
      results: filtered.length > 0 ? filtered : DEMO_PAPERS,
      source: 'Demo Data',
      total: filtered.length > 0 ? filtered.length : DEMO_PAPERS.length,
      notice: 'Research API temporarily unavailable. Showing demo papers.'
    });
  }
});

// GET /api/research/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Demo paper
  if (id.startsWith('demo-')) {
    const paper = DEMO_PAPERS.find(p => p.id === id);
    if (!paper) return res.status(404).json({ error: 'Paper not found.' });
    return res.json(paper);
  }

  try {
    const paper = await getOpenAlexPaper(id);
    res.json(paper);
  } catch (err) {
    console.error('Research fetch error:', err.message);
    res.status(500).json({ error: 'Could not load this research paper. Please try again.' });
  }
});

// POST /api/research/:id/simplify
router.post('/:id/simplify', authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided to simplify.' });

  const aiService = require('../services/aiService');
  try {
    const simplified = await aiService.simplifyText(text);
    res.json({ simplified, note: 'AI-generated simplification — may not capture all nuances of the original.' });
  } catch (err) {
    console.error('Simplify error:', err.message);
    res.status(500).json({ error: 'Could not simplify this text right now. Please try again.' });
  }
});

module.exports = router;
