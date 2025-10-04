const { Schema, model, Types } = require('mongoose');


const exerciseSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    workoutId: { type: Types.ObjectId, ref: 'Workout', index: true },
    name: { type: String, required: true },
    bodyPart: String,
    sets: [{ reps: Number, weightKg: Number, rpe: Number }]
}, { timestamps: true });


module.exports = model('ExerciseLog', exerciseSchema);