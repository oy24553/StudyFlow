const asyncHandler = require('../utils/asyncHandler');
const Workout = require('../models/Workout');
const Exercise = require('../models/ExerciseLog');
const { Types } = require('mongoose');

exports.list = asyncHandler(async (req, res) => {
  const { from, to, focus } = req.query;
  const q = { userId: req.user.id };
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) q.date.$lte = new Date(to);
  if (focus) q.focus = focus;
  const items = await Workout.find(q).sort({ date: -1 }).limit(200).lean();
  res.json({ data: items });
});

exports.getOne = asyncHandler(async (req, res) => {
  const wid = req.params.id;
  const item = await Workout.findOne({ _id: wid, userId: req.user.id }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const exercises = await Exercise.find({ workoutId: wid, userId: req.user.id }).sort({ createdAt: 1 }).lean();
  res.json({ data: { ...item, exercises } });
});

exports.create = asyncHandler(async (req, res) => {
  const body = { ...req.body, userId: req.user.id };
  const item = await Workout.create(body);
  res.status(201).json({ data: item });
});

exports.update = asyncHandler(async (req, res) => {
  const item = await Workout.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const owned = await Workout.findOne({ _id: id, userId: req.user.id }).lean();
  if (!owned) return res.status(404).json({ error: 'Not found' });
  await Exercise.deleteMany({ workoutId: id, userId: req.user.id });
  await Workout.deleteOne({ _id: id, userId: req.user.id });
  res.json({ data: true });
});

exports.addExercise = asyncHandler(async (req, res) => {
  const { id } = req.params; // workoutId
  const wid = await Workout.findOne({ _id: id, userId: req.user.id }).lean();
  if (!wid) return res.status(404).json({ error: 'Workout not found' });

  const payload = {
    userId: req.user.id,
    workoutId: id,
    name: req.body.name,
    bodyPart: req.body.bodyPart,
    sets: Array.isArray(req.body.sets) ? req.body.sets : []
  };
  const ex = await Exercise.create(payload);
  res.status(201).json({ data: ex });
});
