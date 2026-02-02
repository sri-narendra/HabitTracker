const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', habitController.createHabit);
router.get('/', habitController.getHabits);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

router.post('/:id/toggle', habitController.toggleCompletion);
router.get('/completions', habitController.getCompletions);

module.exports = router;
