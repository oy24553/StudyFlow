const router = require('express').Router();
const auth = require('../middlewares/auth');
const s = require('../controllers/studyController');

// 受保护
router.use(auth);

// 列表（支持 ?from=ISO&to=ISO&course=...）
router.get('/', s.list);

// 新建
router.post('/', s.create);

// 更新
router.patch('/:id', s.update);

// 删除
router.delete('/:id', s.remove);

module.exports = router;
