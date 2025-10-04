const Study = require('../models/StudySession');
const asyncHandler = require('../utils/asyncHandler');


exports.list = asyncHandler(async (req, res) => {
    const { from, to, course } = req.query;
    const q = { userId: req.user.id };
    if (from || to) q.startAt = {};
    if (from) q.startAt.$gte = new Date(from);
    if (to) q.startAt.$lte = new Date(to);
    if (course) q.courseId = course;
    const items = await Study.find(q).sort({ startAt: -1 }).limit(500);
    res.json({ data: items });
});


exports.create = asyncHandler(async (req, res) => {
    const item = await Study.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ data: item });
});


exports.update = asyncHandler(async (req, res) => {
    const item = await Study.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ data: item });
});


exports.remove = asyncHandler(async (req, res) => {
    const ok = await Study.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (!ok.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.json({ data: true });
});