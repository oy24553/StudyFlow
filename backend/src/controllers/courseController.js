const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');


exports.list = asyncHandler(async (req, res) => {
    const items = await Course.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ data: items });
});


exports.create = asyncHandler(async (req, res) => {
    const item = await Course.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ data: item });
});


exports.update = asyncHandler(async (req, res) => {
    const item = await Course.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ data: item });
});


exports.remove = asyncHandler(async (req, res) => {
    const ok = await Course.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (!ok.deletedCount) return res.status(404).json({ error: 'Not found' });
    res.json({ data: true });
});