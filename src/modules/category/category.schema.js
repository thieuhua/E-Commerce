const Joi = require('joi');

const createCategorySchema = Joi.object({
  name:        Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).allow(null, ''),
  parent_id:   Joi.number().integer().positive().allow(null),
});

const updateCategorySchema = Joi.object({
  name:        Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(1000).allow(null, ''),
  parent_id:   Joi.number().integer().positive().allow(null),
});

module.exports = { createCategorySchema, updateCategorySchema };