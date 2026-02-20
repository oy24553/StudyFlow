const router = require('express').Router();
const auth = require('../middlewares/auth');
const c = require('../controllers/roomController');

router.use(auth);
router.get('/', c.listMine);
router.post('/', c.create);
router.post('/join', c.joinByCode);
router.get('/:id', c.get);

module.exports = router;

