const router = require('express').Router();
router.get('/health', (req, res) => res.json({ ok: true }));


router.use('/auth', require('./auth'));
router.use('/courses', require('./courses'));
router.use('/study-sessions', require('./studySessions'));
router.use('/workouts', require('./workouts'));
router.use('/exercises', require('./exercises'));
router.use('/stats', require('./stats'));


module.exports = router;