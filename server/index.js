require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./db/database');

const authRoutes = require('./routes/auth');
const researchRoutes = require('./routes/research');
const papersRoutes = require('./routes/papers');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests. Please wait a moment before trying again.' }
});
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SAKSHAM', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again.'
      : err.message
  });
});

// Initialize database then start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SAKSHAM Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 AI Mode: ${process.env.OPENAI_API_KEY ? 'OpenAI Live' : 'Demo Mode'}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
