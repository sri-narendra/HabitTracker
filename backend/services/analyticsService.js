const UserStats = require('../models/UserStats');
const HabitCompletion = require('../models/HabitCompletion');

exports.calculateXP = (difficulty) => {
    switch (difficulty) {
        case 'Easy': return 10;
        case 'Medium': return 25;
        case 'Hard': return 50;
        default: return 20;
    }
};

exports.updateStatsAfterCompletion = async (userId, habitId, date, isIncrement) => {
    try {
        const stats = await UserStats.findOne({ userId });
        if (!stats) return;

        const xpGain = this.calculateXP('Medium'); // Default to Medium for now or fetch habit difficulty

        if (isIncrement) {
            stats.xp += xpGain;
            stats.totalCompletions += 1;
            
            // Check for Level Up
            const xpForNextLevel = stats.level * 1000;
            if (stats.xp >= xpForNextLevel) {
                stats.level += 1;
            }
        } else {
            stats.xp = Math.max(0, stats.xp - xpGain);
            stats.totalCompletions = Math.max(0, stats.totalCompletions - 1);
        }

        // Streak logic (Simplified for now - real logic depends on consecutive days)
        // A robust streak calculation would query completions across all habits or specific habit
        await this.recalculateStreaks(userId, stats);

        stats.lastUpdated = new Date();
        await stats.save();
        return stats;
    } catch (err) {
        console.error('Error updating stats:', err);
    }
};

exports.recalculateStreaks = async (userId, stats) => {
    // This logic should find distinct dates of completions
    const completions = await HabitCompletion.find({ userId }).sort({ date: -1 });
    if (completions.length === 0) {
        stats.currentStreak = 0;
        return;
    }

    const uniqueDates = [...new Set(completions.map(c => c.date))].sort().reverse();
    
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0]; // Simple UTC date
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if the latest completion is today or yesterday to maintain the streak
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const current = new Date(uniqueDates[i]);
            const next = new Date(uniqueDates[i+1]);
            const diff = (current - next) / (1000 * 60 * 60 * 24);
            
            if (diff === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    } else {
        currentStreak = 0;
    }

    stats.currentStreak = currentStreak;
    if (currentStreak > stats.longestStreak) {
        stats.longestStreak = currentStreak;
    }
};
