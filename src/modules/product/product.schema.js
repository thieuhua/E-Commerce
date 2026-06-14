const Joi = require('joi');

const createProductSchema = Joi.object({
  category_id:    Joi.number().integer().positive().required(),
  brand_id:       Joi.number().integer().positive().required(),
  name:           Joi.string().min(2).max(255).required(),
  description:    Joi.string().max(5000).optional(),
  price:          Joi.number().integer().min(0).required(),
  stock_quantity: Joi.number().integer().min(0).default(0),
  status:         Joi.string().valid('active', 'inactive', 'out_of_stock').default('active'),
});

const updateProductSchema = createProductSchema.fork(
  ['category_id', 'brand_id', 'name', 'price'],
  (f) => f.optional()
);

const listProductSchema = Joi.object({
  page:        Joi.number().integer().min(1).default(1),
  limit:       Joi.number().integer().min(1).max(100).default(20),
  category_id: Joi.number().integer().positive().optional(),
  brand_id:    Joi.number().integer().positive().optional(),
  status:      Joi.string().valid('active', 'inactive', 'out_of_stock').optional(),
  search:      Joi.string().max(100).optional(),
  sort_by:     Joi.string().valid('price', 'created_at', 'name').default('created_at'),
  order:       Joi.string().valid('asc', 'desc').default('desc'),
  min_price:   Joi.number().integer().min(0).optional(),
  max_price:   Joi.number().integer().min(0).optional(),
});

module.exports = { createProductSchema, updateProductSchema, listProductSchema };
