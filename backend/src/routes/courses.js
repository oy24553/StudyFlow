const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/courseController');
router.use(auth);
router.get('/', c.list);
router.post('/', c.create);
router.patch('/:id', c.update);
router.delete('/:id', c.remove);
module.exports = router;