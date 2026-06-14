const Joi = require('joi');

const registerSchema = Joi.object({
  username:  Joi.string().alphanum().min(3).max(50).required(),
  email:     Joi.string().email().max(255).required(),
  password:  Joi.string().min(8).max(72).required(),
  full_name: Joi.string().min(2).max(100).required(),
  phone:     Joi.string().pattern(/^[0-9]{9,11}$/).optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
