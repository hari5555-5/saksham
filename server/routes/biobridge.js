const express = require('express');
const { getDb, run, get, all } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const biobridgeAi = require('../services/biobridgeAiService');

const router = express.Router();

// ----------------------------------------------------
// 1. RESEARCH MODULE ENDPOINTS
// ----------------------------------------------------

// GET /api/biobridge/research — List papers with filters
router.get('/research', async (req, res) => {
  try {
    const db = await getDb();
    const { category, topic, search, transgender_pathway, autism_pathway } = req.query;

    let sql = 'SELECT * FROM research_papers WHERE 1=1';
    const params = [];

    if (transgender_pathway === '1' || transgender_pathway === 'true') {
      sql += ' AND is_transgender_pathway = 1';
    }
    if (autism_pathway === '1' || autism_pathway === 'true') {
      sql += ' AND is_autism_pathway = 1';
    }
    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (topic) {
      sql += ' AND topic LIKE ?';
      params.push(`%${topic}%`);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR abstract LIKE ? OR biomarkers LIKE ? OR authors LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY publication_year DESC, id DESC';
    const papers = all(db, sql, params);
    res.json({ papers });
  } catch (err) {
    console.error('Fetch research error:', err);
    res.status(500).json({ error: 'Could not fetch research papers.' });
  }
});

// GET /api/biobridge/research/:id — Get paper details
router.get('/research/:id', async (req, res) => {
  try {
    const db = await getDb();
    const paper = get(db, 'SELECT * FROM research_papers WHERE id = ?', [req.params.id]);
    if (!paper) return res.status(404).json({ error: 'Research paper not found.' });
    res.json({ paper });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching paper.' });
  }
});

// POST /api/biobridge/research — Upload / Enter new paper
router.post('/research', authenticateToken, async (req, res) => {
  try {
    const { title, abstract, authors, publication_year, category, topic, methodology, biomarkers, source, url, population_studied, is_transgender_pathway, is_autism_pathway } = req.body;
    if (!title || !abstract) return res.status(400).json({ error: 'Title and abstract are required.' });

    const db = await getDb();
    run(db,
      `INSERT INTO research_papers (title, abstract, authors, publication_year, category, topic, methodology, biomarkers, source, url, population_studied, is_transgender_pathway, is_autism_pathway, simplified_summary, biological_meaning)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        abstract,
        authors || 'Independent Biotech Researcher',
        publication_year || new Date().getFullYear(),
        category || 'Biotechnology',
        topic || 'General Bioscience',
        methodology || 'Experimental / Analytical assay',
        biomarkers || 'Specified biological targets',
        source || 'Submitted Paper',
        url || '#',
        population_studied || 'Experimental model',
        is_transgender_pathway ? 1 : 0,
        is_autism_pathway ? 1 : 0,
        'Paper uploaded by user for AI analysis.',
        'Extracted molecular insight from uploaded manuscript.'
      ]
    );

    const newPaper = get(db, 'SELECT * FROM research_papers ORDER BY id DESC LIMIT 1');
    res.status(201).json({ message: 'Research paper added successfully.', paper: newPaper });
  } catch (err) {
    console.error('Upload paper error:', err);
    res.status(500).json({ error: 'Could not save research paper.' });
  }
});

// POST /api/biobridge/research/analyze — Process paper with AI
router.post('/research/analyze', async (req, res) => {
  try {
    const { paperId, paperData } = req.body;
    let paper = paperData;

    if (!paper && paperId) {
      const db = await getDb();
      paper = get(db, 'SELECT * FROM research_papers WHERE id = ?', [paperId]);
    }

    if (!paper) return res.status(400).json({ error: 'Paper data or paperId is required.' });

    const analysis = await biobridgeAi.analyzePaper(paper);
    res.json({ paper, analysis });
  } catch (err) {
    console.error('Analyze paper error:', err);
    res.status(500).json({ error: 'Error performing AI paper analysis.' });
  }
});

// POST /api/biobridge/research/ask — Ask the Paper chatbot
router.post('/research/ask', async (req, res) => {
  try {
    const { paper, question } = req.body;
    if (!paper || !question) return res.status(400).json({ error: 'Paper context and question are required.' });

    const answer = await biobridgeAi.askPaper(paper, question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'Could not generate answer for this paper.' });
  }
});

// ----------------------------------------------------
// 2. COMPETITIVE MODULE ENDPOINTS
// ----------------------------------------------------

// GET /api/biobridge/competitive/questions — Get MCQs
router.get('/competitive/questions', async (req, res) => {
  try {
    const db = await getDb();
    const { exam, topic } = req.query;

    let sql = 'SELECT * FROM competitive_questions WHERE 1=1';
    const params = [];

    if (exam && exam !== 'All') {
      sql += ' AND exam = ?';
      params.push(exam);
    }
    if (topic && topic !== 'All') {
      sql += ' AND topic = ?';
      params.push(topic);
    }

    const rows = all(db, sql, params);
    const questions = rows.map(r => ({
      ...r,
      options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options
    }));

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: 'Could not load competitive questions.' });
  }
});

// POST /api/biobridge/competitive/explain — AI Concept Detection on wrong answer
router.post('/competitive/explain', async (req, res) => {
  try {
    const { question, selectedAnswer, correctAnswer } = req.body;
    if (!question || selectedAnswer === undefined) {
      return res.status(400).json({ error: 'Question data and selected answer required.' });
    }

    const explanation = await biobridgeAi.explainConcept(question, selectedAnswer, correctAnswer);
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: 'Error generating concept breakdown.' });
  }
});

// POST /api/biobridge/competitive/performance — Save practice result
router.post('/competitive/performance', authenticateToken, async (req, res) => {
  try {
    const { questionId, answer, correct } = req.body;
    const db = await getDb();

    run(db,
      'INSERT INTO user_performance (user_id, question_id, answer, correct) VALUES (?, ?, ?, ?)',
      [req.user.userId, questionId, answer, correct ? 1 : 0]
    );

    res.json({ message: 'Performance recorded successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not save performance.' });
  }
});

// GET /api/biobridge/competitive/analytics — Performance metrics
router.get('/competitive/analytics', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const rows = all(db, `
      SELECT p.*, q.topic, q.exam, q.concept
      FROM user_performance p
      JOIN competitive_questions q ON p.question_id = q.id
      WHERE p.user_id = ?
      ORDER BY p.timestamp DESC
    `, [req.user.userId]);

    const total = rows.length;
    const correctCount = rows.filter(r => r.correct === 1).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Topic breakdown
    const topicStats = {};
    for (const r of rows) {
      if (!topicStats[r.topic]) topicStats[r.topic] = { total: 0, correct: 0 };
      topicStats[r.topic].total++;
      if (r.correct === 1) topicStats[r.topic].correct++;
    }

    const strongTopics = [];
    const weakTopics = [];
    Object.keys(topicStats).forEach(top => {
      const stat = topicStats[top];
      const acc = Math.round((stat.correct / stat.total) * 100);
      if (acc >= 70) strongTopics.push({ topic: top, accuracy: acc });
      else weakTopics.push({ topic: top, accuracy: acc });
    });

    res.json({
      totalQuestionsAnswered: total,
      correctCount,
      accuracy,
      strongTopics,
      weakTopics,
      recentAttempts: rows.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load competitive analytics.' });
  }
});

// ----------------------------------------------------
// 3. INNOVATE MODULE ENDPOINTS
// ----------------------------------------------------

// POST /api/biobridge/innovate/generate-project — AI project generator
router.post('/innovate/generate-project', authenticateToken, async (req, res) => {
  try {
    const { interest } = req.body;
    if (!interest) return res.status(400).json({ error: 'Interest prompt is required.' });

    const projectData = await biobridgeAi.generateProjectIdea(interest);

    // Save to user's saved project ideas
    const db = await getDb();
    run(db,
      `INSERT INTO project_ideas (user_id, title, interest, biological_problem, research_question, biomarker, methodology, biosensor_possibility, generated_content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        projectData.title,
        interest,
        projectData.problem_statement,
        projectData.research_question,
        projectData.biomarker,
        projectData.methodology,
        projectData.biosensor_possibility,
        JSON.stringify(projectData)
      ]
    );

    const savedProject = get(db, 'SELECT * FROM project_ideas WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.userId]);

    res.status(201).json({ project: projectData, savedRecord: savedProject });
  } catch (err) {
    console.error('Generate project error:', err);
    res.status(500).json({ error: 'Could not generate biotechnology project idea.' });
  }
});

// GET /api/biobridge/innovate/projects — List user saved projects
router.get('/innovate/projects', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const projects = all(db, 'SELECT * FROM project_ideas WHERE user_id = ? ORDER BY id DESC', [req.user.userId]);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Could not load saved project ideas.' });
  }
});

// ----------------------------------------------------
// 4. BIOMARKER & BIOSENSOR ENDPOINTS
// ----------------------------------------------------

const SAMPLE_BIOMARKERS = [
  {
    name: "MicroRNA-21 (MiR-21)",
    type: "RNA",
    category: "Proteins & RNA",
    function: "Oncogenic regulatory microRNA overexpressed in circulating tumor exosomes.",
    research_area: "Cancer Biology & Liquid Biopsy",
    why_measured: "Serves as an early diagnostic marker for invasive ductal carcinomas and solid tumors.",
    detection_methods: "Surface-enhanced Raman Spectroscopy, Gold nanoparticle electrochemical aptasensing, RT-qPCR.",
    biosensor_potential: "High — Compatible with gold nanocomposite electrode test strips."
  },
  {
    name: "Glucose",
    type: "Metabolite",
    category: "Metabolites",
    function: "Primary cellular energy substrate involved in glycolysis and oxidative phosphorylation.",
    research_area: "Metabolic Disorders & Wearable Tech",
    why_measured: "Critical for glycemic management and bioenergetic metabolic rate evaluation.",
    detection_methods: "Glucose Oxidase (GOD) amperometric electrode, enzymatic colorimetric assay.",
    biosensor_potential: "Very High — Standard electrochemical test strips and continuous glucose monitors (CGM)."
  },
  {
    name: "Estradiol (E2)",
    type: "Hormone",
    category: "Hormones",
    function: "Primary estrogenic steroid hormone modulating reproductive tissues, bone density, and lipid metabolism.",
    research_area: "Endocrinology & Gender-Affirming Healthcare",
    why_measured: "Evaluates systemic hormone concentrations during gender-affirming hormone therapy (GAHT) and fertility tracking.",
    detection_methods: "Competitive Chemiluminescent Immunoassay (CLIA), LC-MS/MS, Antibody biosensors.",
    biosensor_potential: "High — Aptamer-based electrochemical microfluidic chips."
  },
  {
    name: "Brain-Derived Neurotrophic Factor (BDNF)",
    type: "Protein",
    category: "Proteins & RNA",
    function: "Neurotrophin involved in neuronal plastic growth, synaptic maturation, and memory encoding.",
    research_area: "Neurobiology & Neurodevelopment",
    why_measured: "Measured to observe neuroplastic responses, neurodivergent synaptic patterns, and stress resilience.",
    detection_methods: "ELISA, Surface Plasmon Resonance (SPR) biosensors, Fluorescent immunoassay.",
    biosensor_potential: "Medium — Optical fiber SPR biosensors."
  },
  {
    name: "Propionate / Short-Chain Fatty Acids (SCFAs)",
    type: "Metabolite",
    category: "Metabolites",
    function: "Microbial fermentation metabolites acting as signaling ligands along the gut-brain axis.",
    research_area: "Metabolomics & Gut Microbiome",
    why_measured: "Assesses gut microbiome activity and neuro-metabolic crosstalk in neurodevelopment.",
    detection_methods: "Gas Chromatography-Mass Spectrometry (GC-MS), Enzymatic SCFA sensors.",
    biosensor_potential: "Medium — Enzymatic amperometric sensor arrays."
  }
];

// GET /api/biobridge/biomarkers — List biomarkers
router.get('/biomarkers', (req, res) => {
  const { category, search } = req.query;
  let list = [...SAMPLE_BIOMARKERS];

  if (category && category !== 'All') {
    list = list.filter(b => b.category.toLowerCase().includes(category.toLowerCase()) || b.type.toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(b => b.name.toLowerCase().includes(s) || b.function.toLowerCase().includes(s) || b.research_area.toLowerCase().includes(s));
  }

  res.json({ biomarkers: list });
});

// POST /api/biobridge/biosensors/design — Interactive Biosensor Builder
router.post('/biosensors/design', async (req, res) => {
  try {
    const { target, bioreceptor, transducer, measurement } = req.body;
    if (!target || !bioreceptor || !transducer || !measurement) {
      return res.status(400).json({ error: 'Target, bioreceptor, transducer, and measurement signal are required.' });
    }

    const designResult = await biobridgeAi.designBiosensor(target, bioreceptor, transducer, measurement);
    res.json({ design: designResult });
  } catch (err) {
    res.status(500).json({ error: 'Error processing biosensor design.' });
  }
});

// ----------------------------------------------------
// 5. BIOTECHNOLOGY EXPERIMENTS MODULE ENDPOINTS
// ----------------------------------------------------

// GET /api/biobridge/experiments — List virtual experiments
router.get('/experiments', async (req, res) => {
  try {
    const db = await getDb();
    const { category, search } = req.query;

    let sql = 'SELECT * FROM biotech_experiments WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR aim LIKE ? OR category LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY id ASC';
    const rows = all(db, sql, params);

    const experiments = rows.map(r => ({
      ...r,
      materials: typeof r.materials === 'string' ? JSON.parse(r.materials) : r.materials,
      procedure_steps: typeof r.procedure_steps === 'string' ? JSON.parse(r.procedure_steps) : r.procedure_steps,
      biosensor_biomarker_data: typeof r.biosensor_biomarker_data === 'string' ? JSON.parse(r.biosensor_biomarker_data) : r.biosensor_biomarker_data
    }));

    res.json({ experiments });
  } catch (err) {
    console.error('Fetch experiments error:', err);
    res.status(500).json({ error: 'Could not load virtual biotechnology experiments.' });
  }
});

// GET /api/biobridge/experiments/:id — Get experiment details
router.get('/experiments/:id', async (req, res) => {
  try {
    const db = await getDb();
    const r = get(db, 'SELECT * FROM biotech_experiments WHERE id = ?', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Experiment not found.' });

    const experiment = {
      ...r,
      materials: typeof r.materials === 'string' ? JSON.parse(r.materials) : r.materials,
      procedure_steps: typeof r.procedure_steps === 'string' ? JSON.parse(r.procedure_steps) : r.procedure_steps,
      biosensor_biomarker_data: typeof r.biosensor_biomarker_data === 'string' ? JSON.parse(r.biosensor_biomarker_data) : r.biosensor_biomarker_data
    };

    res.json({ experiment });
  } catch (err) {
    res.status(500).json({ error: 'Error loading experiment details.' });
  }
});

module.exports = router;
