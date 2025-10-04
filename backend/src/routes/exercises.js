const router = require('express').Router();
const auth = require('../middlewares/auth');
const e = require('../controllers/exerciseController');

// 受保护
router.use(auth);

// 更新某条动作记录（名字/部位/sets 等）
router.patch('/:id', e.update);

// 删除某条动作记录
router.delete('/:id', e.remove);

module.exports = router;
