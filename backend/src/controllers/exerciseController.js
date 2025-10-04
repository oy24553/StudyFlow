const asyncHandler = require('../utils/asyncHandler');
const Exercise = require('../models/ExerciseLog');

exports.update = asyncHandler(async (req, res) => {
  const item = await Exercise.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

exports.remove = asyncHandler(async (req, res) => {
  const ok = await Exercise.deleteOne({ _id: req.params.id, userId: req.user.id });
  if (!ok.deletedCount) return res.status(404).json({ error: 'Not found' });
  res.json({ data: true });
});
