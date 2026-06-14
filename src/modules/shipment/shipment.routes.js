const router = require('express').Router();
const ctrl = require('./shipment.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');
const Joi = require('joi');
const validate = require('../../middlewares/validate');

router.use(verifyToken);

const createSchema = Joi.object({
  tracking_code: Joi.string().max(100).optional(),
  carrier:       Joi.string().max(100).optional(),
});
const updateSchema = Joi.object({
  status:        Joi.string().valid('preparing','picked_up','in_transit','delivered','failed','returned').required(),
  tracking_code: Joi.string().max(100).optional(),
  carrier:       Joi.string().max(100).optional(),
});

// Customer: track their order
router.get('/order/:orderId', ctrl.getByOrder);

// Admin/Staff
router.post('/order/:orderId',        requireRole('admin','staff'), validate(createSchema), ctrl.create);
router.patch('/:shipmentId/status',   requireRole('admin','staff'), validate(updateSchema), ctrl.updateStatus);

module.exports = router;
