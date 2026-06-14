const router = require('express').Router();
const ctrl = require('./user.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');
const Joi = require('joi');
const validate = require('../../middlewares/validate');

router.use(verifyToken);

const profileSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  phone:     Joi.string().pattern(/^[0-9]{9,11}$/).optional(),
});
const passwordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password:     Joi.string().min(8).max(72).required(),
});
const roleSchema = Joi.object({
  role: Joi.string().valid('customer', 'admin', 'staff').required(),
});

// Profile (own)
router.get('/profile',          ctrl.getProfile);
router.patch('/profile',        validate(profileSchema),  ctrl.updateProfile);
router.patch('/change-password', validate(passwordSchema), ctrl.changePassword);

// Admin
router.get('/',          requireRole('admin'), ctrl.listAll);
router.patch('/:id/role', requireRole('admin'), validate(roleSchema), ctrl.setRole);

module.exports = router;
