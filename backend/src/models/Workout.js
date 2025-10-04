const { Schema, model, Types } = require('mongoose');


const workoutSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    date: { type: Date, default: Date.now },
    focus: { type: String, enum: ['push', 'pull', 'legs', 'upper', 'lower', 'full', 'other'], default: 'other' },
    notes: String
}, { timestamps: true });


module.exports = model('Workout', workoutSchema);