const Study = require('../models/StudySession');
const asyncHandler = require('../utils/asyncHandler');
const { Types } = require('mongoose');

function parseDate(v, fallback) {
  const d = v ? new Date(v) : fallback;
  return Number.isFinite(+d) ? d : fallback;
}

function parseRange(req, { defaultDays }) {
  const to = parseDate(req.query.to, new Date());
  const from = parseDate(
    req.query.from,
    new Date(to.getTime() - defaultDays * 86400000)
  );
  return { from, to };
}

function parseTz(req) {
  const tz = String(req.query.tz || process.env.STATS_TZ || 'UTC').trim();
  return tz || 'UTC';
}

exports.study7d = asyncHandler(async (req, res) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); 
  const uidObj = new Types.ObjectId(req.user.id); 

  const data = await Study.aggregate([
    {
      $match: {
        userId: uidObj,
        startAt: { $gte: start, $lte: end }
      }
    },
    {
      $project: {
        day: { $dateToString: { format: '%Y-%m-%d', date: '$startAt', timezone: 'UTC' } },
        durationMins: {
          $divide: [
            { $subtract: [ { $ifNull: ['$endAt', '$$NOW'] }, '$startAt' ] },
            60000
          ]
        }
      }
    },
    { $group: { _id: '$day', total: { $sum: '$durationMins' } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({ data });
});

/**
 * Heatmap: minutes aggregated by ISO day-of-week (1..7, Mon..Sun) and hour (0..23)
 * GET /api/stats/study-heatmap?from=ISO&to=ISO
 */
exports.studyHeatmap = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req, { defaultDays: 30 });
  const uidObj = new Types.ObjectId(req.user.id);

  const rows = await Study.aggregate([
    { $match: { userId: uidObj, startAt: { $gte: from, $lte: to } } },
    {
      $project: {
        d: { $isoDayOfWeek: '$startAt' },
        h: { $hour: '$startAt' },
        mins: {
          $divide: [
            { $subtract: [{ $ifNull: ['$endAt', '$$NOW'] }, '$startAt'] },
            60000,
          ],
        },
      },
    },
    { $group: { _id: { d: '$d', h: '$h' }, mins: { $sum: '$mins' } } },
    { $project: { _id: 0, d: '$_id.d', h: '$_id.h', mins: { $round: ['$mins', 0] } } },
    { $sort: { d: 1, h: 1 } },
  ]);

  res.json({ data: rows });
});

/**
 * By-hour total minutes (0..23), useful for simple charts.
 * GET /api/stats/study-by-hour?from=ISO&to=ISO
 */
exports.studyByHour = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req, { defaultDays: 7 });
  const uidObj = new Types.ObjectId(req.user.id);

  const rows = await Study.aggregate([
    { $match: { userId: uidObj, startAt: { $gte: from, $lte: to } } },
    {
      $project: {
        h: { $hour: '$startAt' },
        mins: {
          $divide: [
            { $subtract: [{ $ifNull: ['$endAt', '$$NOW'] }, '$startAt'] },
            60000,
          ],
        },
      },
    },
    { $group: { _id: '$h', mins: { $sum: '$mins' } } },
    { $project: { _id: 0, h: '$_id', mins: { $round: ['$mins', 0] } } },
    { $sort: { h: 1 } },
  ]);

  res.json({ data: rows });
});

/**
 * Top courses by minutes
 * GET /api/stats/course-top?from=ISO&to=ISO&limit=5
 */
exports.courseTop = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req, { defaultDays: 30 });
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '5', 10) || 5));
  const uidObj = new Types.ObjectId(req.user.id);

  const rows = await Study.aggregate([
    { $match: { userId: uidObj, startAt: { $gte: from, $lte: to } } },
    {
      $project: {
        courseId: { $ifNull: ['$courseId', null] },
        mins: {
          $divide: [
            { $subtract: [{ $ifNull: ['$endAt', '$$NOW'] }, '$startAt'] },
            60000,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$courseId',
        mins: { $sum: '$mins' },
        sessions: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'courses',
        let: { cid: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$_id', '$$cid'] }, { $eq: ['$userId', uidObj] }] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: 'course',
      },
    },
    {
      $addFields: {
        name: {
          $ifNull: [{ $arrayElemAt: ['$course.name', 0] }, 'Unassigned'],
        },
      },
    },
    { $project: { _id: 0, courseId: '$_id', name: 1, mins: { $round: ['$mins', 0] }, sessions: 1 } },
    { $sort: { mins: -1 } },
    { $limit: limit },
  ]);

  res.json({ data: rows });
});

/**
 * Breakdown by method
 * GET /api/stats/method-breakdown?from=ISO&to=ISO
 */
exports.methodBreakdown = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req, { defaultDays: 30 });
  const uidObj = new Types.ObjectId(req.user.id);

  const rows = await Study.aggregate([
    { $match: { userId: uidObj, startAt: { $gte: from, $lte: to } } },
    {
      $project: {
        method: { $ifNull: ['$method', 'deep'] },
        mins: {
          $divide: [
            { $subtract: [{ $ifNull: ['$endAt', '$$NOW'] }, '$startAt'] },
            60000,
          ],
        },
      },
    },
    { $group: { _id: '$method', mins: { $sum: '$mins' }, sessions: { $sum: 1 } } },
    { $project: { _id: 0, method: '$_id', mins: { $round: ['$mins', 0] }, sessions: 1 } },
    { $sort: { mins: -1 } },
  ]);

  res.json({ data: rows });
});

/**
 * Generic time series (day/week/month)
 * GET /api/stats/study-series?from=ISO&to=ISO&bucket=day|week|month&tz=UTC
 */
exports.studySeries = asyncHandler(async (req, res) => {
  const { from, to } = parseRange(req, { defaultDays: 90 });
  const bucket = String(req.query.bucket || 'day').trim();
  const tz = parseTz(req);
  const uidObj = new Types.ObjectId(req.user.id);

  const unit = bucket === 'month' ? 'month' : bucket === 'week' ? 'week' : 'day';

  const rows = await Study.aggregate([
    { $match: { userId: uidObj, startAt: { $gte: from, $lte: to } } },
    {
      $project: {
        t: { $dateTrunc: { date: '$startAt', unit, timezone: tz } },
        mins: {
          $divide: [
            { $subtract: [{ $ifNull: ['$endAt', '$$NOW'] }, '$startAt'] },
            60000,
          ],
        },
      },
    },
    { $group: { _id: '$t', mins: { $sum: '$mins' } } },
    { $project: { _id: 0, t: '$_id', mins: { $round: ['$mins', 0] } } },
    { $sort: { t: 1 } },
  ]);

  res.json({ data: rows, meta: { bucket: unit, tz, from, to } });
});
