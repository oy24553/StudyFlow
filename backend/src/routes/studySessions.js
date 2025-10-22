const router = require('express').Router();
const auth = require('../middlewares/auth');
const s = require('../controllers/studyController');

// Protected
router.use(auth);

// List (supports ?from=ISO&to=ISO&course=...)
router.get('/', s.list);

// Create
router.post('/', s.create);

// Update
router.patch('/:id', s.update);

// Delete
router.delete('/:id', s.remove);

module.exports = router;
