const router = require('express').Router();
const ctrl = require('./order.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

// Customer routes
router.get('/my',         ctrl.myOrders);
router.get('/my/:id',     ctrl.getMyOrder);
router.post('/',          ctrl.create);
router.patch('/my/:id/cancel', ctrl.cancel);

// Admin routes
router.get('/',           requireRole('admin', 'staff'), ctrl.listAll);
router.patch('/:id/status', requireRole('admin', 'staff'), ctrl.updateStatus);

module.exports = router;
