const Joi = require('joi');

const addressSchema = Joi.object({
  receiver_name: Joi.string().min(2).max(100).required(),
  phone:         Joi.string().pattern(/^[0-9]{9,11}$/).required(),
  province:      Joi.string().max(100).required(),
  district:      Joi.string().max(100).required(),
  ward:          Joi.string().max(100).required(),
  detail:        Joi.string().max(255).required(),
  is_default:    Joi.boolean().default(false),
});

const updateAddressSchema = addressSchema.fork(
  ['receiver_name', 'phone', 'province', 'district', 'ward', 'detail'],
  (f) => f.optional()
);

module.exports = { addressSchema, updateAddressSchema };
