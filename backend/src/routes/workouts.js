const router = require('express').Router();
const auth = require('../middlewares/auth');
const w = require('../controllers/workoutController');

// 受保护
router.use(auth);

// 获取训练列表（支持 ?from=ISO&to=ISO&focus=pull|push|...）
router.get('/', w.list);

// 获取单个训练（含该训练下的动作列表）
router.get('/:id', w.getOne);

// 新建训练（空壳，后续通过 /:id/exercises 添加动作）
router.post('/', w.create);

// 修改训练（日期、备注、focus 等）
router.patch('/:id', w.update);

// 删除训练（会级联删除该训练下的 ExerciseLog）
router.delete('/:id', w.remove);

// 给某次训练新增一个动作记录
router.post('/:id/exercises', w.addExercise);

module.exports = router;
