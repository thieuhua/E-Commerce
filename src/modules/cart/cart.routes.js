const router = require('express').Router();
const ctrl = require('./cart.controller');
const { verifyToken } = require('../../middlewares/auth');
const Joi = require('joi');
const validate = require('../../middlewares/validate');

router.use(verifyToken);

const addSchema    = Joi.object({ product_id: Joi.number().integer().positive().required(), quantity: Joi.number().integer().min(1).default(1) });
const updateSchema = Joi.object({ quantity: Joi.number().integer().min(1).required() });

router.get('/',                   ctrl.get);
router.post('/items',             validate(addSchema),    ctrl.addItem);
router.patch('/items/:itemId',    validate(updateSchema), ctrl.updateItem);
router.delete('/items/:itemId',   ctrl.removeItem);
router.delete('/',                ctrl.clear);

module.exports = router;
