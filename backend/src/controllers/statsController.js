// src/controllers/statsController.js
const Study = require('../models/StudySession');
const Workout = require('../models/Workout');
const asyncHandler = require('../utils/asyncHandler');
const { Types } = require('mongoose'); // ★ 关键：从 mongoose 引入 Types

// 近 7 天学习总时长（分钟）按日
exports.study7d = asyncHandler(async (req, res) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6); // 包含今天共 7 天
  const uidObj = new Types.ObjectId(req.user.id); // ★ 标准 ObjectId

  const data = await Study.aggregate([
    {
      $match: {
        userId: uidObj,
        startAt: { $gte: start, $lte: end }
      }
    },
    {
      // ★ endAt 可能为空：用 $$NOW 代替，避免 NaN；并统一按 UTC 聚合到“天”
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

// 本周训练次数
exports.workoutWeekly = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const uidObj = new Types.ObjectId(req.user.id); // ★ 标准 ObjectId

  const data = await Workout.aggregate([
    {
      $match: {
        userId: uidObj,
        date: { $gte: start, $lte: now }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ data });
});
