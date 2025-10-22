const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const error = require('./middlewares/error');

const app = express();

/** Base middleware */
app.use(express.json());
app.use(helmet());

/** CORS: supports comma-separated whitelist (e.g., A,B,C) */
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: origins.length ? origins : true, // Allow all origins if not configured (dev)
    credentials: true,
  })
);

app.use(morgan('dev'));

/** ✅ Health check (Render/Vercel probe & manual test) */
app.get('/api/health', (req, res) => res.json({ ok: true }));

/** Rate limiting (/api global + stricter on /api/auth) */
const apiLimiter = rateLimit({ windowMs: 60_000, max: 120 });
const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

/** Business routes (mounted under /api) */
app.use('/api', routes);

/** Unified 404 (optional) */
app.use((req, res) => res.status(404).json({ ok: false, error: 'Not Found' }));

/** Error handling middleware */
app.use(error);

module.exports = app;
