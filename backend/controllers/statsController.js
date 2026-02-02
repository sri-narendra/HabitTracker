const UserStats = require('../models/UserStats');

exports.getStats = async (req, res, next) => {
    try {
        const stats = await UserStats.findOne({ userId: req.user.id });
        if (!stats) return res.status(404).json({ error: 'Stats not found' });
        res.json(stats);
    } catch (err) {
        next(err);
    }
};
