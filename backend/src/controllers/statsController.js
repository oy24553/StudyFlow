const Study = require('../models/StudySession');
const asyncHandler = require('../utils/asyncHandler');
const { Types } = require('mongoose');

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
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30 * 86400000);
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
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 7 * 86400000);
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
