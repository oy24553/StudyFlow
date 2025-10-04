const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const error = require('./middlewares/error');


const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 60_000, max: 120 }));
app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 10 }));
app.use('/api', routes);
app.use(error);
module.exports = app;