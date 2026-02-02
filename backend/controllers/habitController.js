const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const analyticsService = require('../services/analyticsService');

exports.createHabit = async (req, res, next) => {
    try {
        const { name, category, difficulty, frequency } = req.body;
        const habit = new Habit({
            userId: req.user.id,
            name,
            category,
            difficulty,
            frequency
        });
        await habit.save();
        res.status(201).json(habit);
    } catch (err) {
        next(err);
    }
};

exports.getHabits = async (req, res, next) => {
    try {
        const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (err) {
        next(err);
    }
};

exports.updateHabit = async (req, res, next) => {
    try {
        const { name, category, difficulty, frequency } = req.body;
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name, category, difficulty, frequency },
            { new: true }
        );
        if (!habit) return res.status(404).json({ error: 'Habit not found' });
        res.json(habit);
    } catch (err) {
        next(err);
    }
};

exports.deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });
        
        // Also delete all completions for this habit
        await HabitCompletion.deleteMany({ habitId: req.params.id });
        
        res.json({ message: 'Habit deleted' });
    } catch (err) {
        next(err);
    }
};

exports.toggleCompletion = async (req, res, next) => {
    try {
        const { date } = req.body; // YYYY-MM-DD
        const habitId = req.params.id;
        const userId = req.user.id;

        const habit = await Habit.findOne({ _id: habitId, userId });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });

        const existingCompletion = await HabitCompletion.findOne({ habitId, date });

        if (existingCompletion) {
            await HabitCompletion.deleteOne({ _id: existingCompletion._id });
            const stats = await analyticsService.updateStatsAfterCompletion(userId, habitId, date, false);
            res.json({ completed: false, stats });
        } else {
            const completion = new HabitCompletion({ habitId, userId, date });
            await completion.save();
            const stats = await analyticsService.updateStatsAfterCompletion(userId, habitId, date, true);
            res.json({ completed: true, stats });
        }
    } catch (err) {
        next(err);
    }
};

exports.getCompletions = async (req, res, next) => {
    try {
        const { start, end } = req.query; // YYYY-MM-DD
        const query = { userId: req.user.id };
        if (start && end) {
            query.date = { $gte: start, $lte: end };
        }
        const completions = await HabitCompletion.find(query);
        res.json(completions);
    } catch (err) {
        next(err);
    }
};
