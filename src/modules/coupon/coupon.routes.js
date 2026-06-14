const router = require('express').Router();
const ctrl = require('./coupon.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

// Public
router.get('/check', verifyToken, ctrl.check);

// Admin only
router.use(verifyToken, requireRole('admin'));
router.get('/',     ctrl.list);
router.post('/',    ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
