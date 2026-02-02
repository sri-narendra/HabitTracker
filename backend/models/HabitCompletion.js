const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema({
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD (stored in UTC date but representing the user's local day)
    timestamp: { type: Date, default: Date.now } // Actual time of completion
});

// Compound index to prevent duplicate completions for the same habit on the same day
habitCompletionSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitCompletion', habitCompletionSchema);
