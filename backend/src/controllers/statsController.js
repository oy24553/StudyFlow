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

exports.workoutWeekly = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const uidObj = new Types.ObjectId(req.user.id); 

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
