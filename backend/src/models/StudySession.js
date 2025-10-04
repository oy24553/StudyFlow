const { Schema, model, Types } = require('mongoose');


const studySchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    courseId: { type: Types.ObjectId, ref: 'Course' },
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    method: { type: String, enum: ['pomodoro', 'deep', 'review'], default: 'deep' },
    notes: String,
    rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });


module.exports = model('StudySession', studySchema);