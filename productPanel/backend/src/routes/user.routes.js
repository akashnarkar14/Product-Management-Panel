const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { getAll, update, remove } = require('../controllers/user.controller');

router.get('/', auth, getAll);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
