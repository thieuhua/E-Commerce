const router = require('express').Router();
const ctrl = require('./payment.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');
const Joi = require('joi');
const validate = require('../../middlewares/validate');

router.use(verifyToken);

const initiateSchema = Joi.object({ method: Joi.string().valid('cod', 'bank_transfer', 'e_wallet', 'credit_card').required() });
const confirmSchema  = Joi.object({ transaction_ref: Joi.string().max(100).optional() });

// Customer
router.get('/order/:orderId',          ctrl.getByOrder);
router.post('/order/:orderId/initiate', validate(initiateSchema), ctrl.initiate);

// Admin
router.patch('/:paymentId/confirm', requireRole('admin', 'staff'), validate(confirmSchema), ctrl.confirm);
router.patch('/:paymentId/fail',    requireRole('admin', 'staff'), ctrl.markFailed);
router.patch('/:paymentId/refund',  requireRole('admin'),          ctrl.refund);

module.exports = router;
