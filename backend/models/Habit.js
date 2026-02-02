const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    frequency: { type: String, default: 'Daily' }, // Future-proofing
    color: { type: String, default: 'green' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Habit', habitSchema);
