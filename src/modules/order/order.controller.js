const svc = require('./order.service');
const { success, created, paginated } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');
const Joi = require('joi');

const createSchema = Joi.object({
  address_id:  Joi.number().integer().positive().required(),
  coupon_code: Joi.string().optional(),
  note:        Joi.string().max(500).optional(),
});

// Customer
const myOrders = asyncHandler(async (req, res) =>
  success(res, await svc.listByUser(req.user.userId)));

const getMyOrder = asyncHandler(async (req, res) =>
  success(res, await svc.getById(req.params.id, req.user.userId)));

const create = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) throw require('../../utils/apiError').ApiError.badRequest('Validation failed', error.details);
  created(res, await svc.create(req.user.userId, value));
});

const cancel = asyncHandler(async (req, res) =>
  success(res, await svc.updateStatus(req.params.id, 'cancelled', req.user.userId, false)));

// Admin
const listAll = asyncHandler(async (req, res) => {
  const { count, rows } = await svc.listAll(req.query);
  paginated(res, rows, { total: count, page: Number(req.query.page || 1), limit: Number(req.query.limit || 20) });
});

const updateStatus = asyncHandler(async (req, res) =>
  success(res, await svc.updateStatus(req.params.id, req.body.status, null, true)));

module.exports = { myOrders, getMyOrder, create, cancel, listAll, updateStatus };
