const router = require('express').Router();
const auth = require('../middlewares/auth');
const s = require('../controllers/statsController');
router.use(auth);
router.get('/study-7d', s.study7d);
router.get('/study-heatmap', s.studyHeatmap);
router.get('/study-by-hour', s.studyByHour);
module.exports = router;
