const router = require('express').Router();
const ctrl = require('./review.controller');
const { verifyToken } = require('../../middlewares/auth');
const Joi = require('joi');
const validate = require('../../middlewares/validate');

const reviewSchema = Joi.object({
  rating:  Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
});
const updateSchema = reviewSchema.fork(['rating'], (f) => f.optional());

// Public
router.get('/product/:productId', ctrl.listByProduct);

// Authenticated
router.post('/product/:productId',  verifyToken, validate(reviewSchema), ctrl.create);
router.patch('/:reviewId',          verifyToken, validate(updateSchema), ctrl.update);
router.delete('/:reviewId',         verifyToken, ctrl.remove);

module.exports = router;
