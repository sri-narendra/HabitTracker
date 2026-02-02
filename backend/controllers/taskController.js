const Task = require('../models/Task');

exports.createTask = async (req, res, next) => {
    try {
        const { title } = req.body;
        const task = new Task({ userId: req.user.id, title });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
};

exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const { title, completed } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, completed },
            { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        next(err);
    }
};
