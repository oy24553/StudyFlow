const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const error = require('./middlewares/error');

const app = express();

/** 基础中间件 */
app.use(express.json());
app.use(helmet());

/** CORS：支持逗号分隔的白名单（如：A,B,C） */
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: origins.length ? origins : true, // 未配置时对所有源放行（开发用）
    credentials: true,
  })
);

app.use(morgan('dev'));

/** ✅ 健康检查（Render/Vercel 探活 & 手工自测） */
app.get('/api/health', (req, res) => res.json({ ok: true }));

/** 速率限制（/api 全局 + /api/auth 更严格） */
const apiLimiter = rateLimit({ windowMs: 60_000, max: 120 });
const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

/** 业务路由（都挂在 /api 下） */
app.use('/api', routes);

/** 统一 404（可选） */
app.use((req, res) => res.status(404).json({ ok: false, error: 'Not Found' }));

/** 错误处理中间件 */
app.use(error);

module.exports = app;
