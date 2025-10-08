const router = require('express').Router();
const auth = require('../middlewares/auth');
const s = require('../controllers/statsController');
router.use(auth);
router.get('/study-7d', s.study7d);
module.exports = router;