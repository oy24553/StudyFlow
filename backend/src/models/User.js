const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    name: String,
    heightCm: Number,
    goals: {
        studyDailyMins: { type: Number, default: 0 },
        workoutPerWeek: { type: Number, default: 0 }
    }
}, { timestamps: true });


module.exports = model('User', userSchema);