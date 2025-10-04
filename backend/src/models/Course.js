const { Schema, model, Types } = require('mongoose');


const courseSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true },
    tags: [String],
    targetWeeklyMins: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = model('Course', courseSchema);