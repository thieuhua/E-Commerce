const svc = require('./coupon.service');
const { success, created } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const list   = asyncHandler(async (req, res) => success(res, await svc.list()));
const create = asyncHandler(async (req, res) => created(res, await svc.create(req.body)));
const update = asyncHandler(async (req, res) => success(res, await svc.update(req.params.id, req.body)));
const remove = asyncHandler(async (req, res) => { await svc.remove(req.params.id); success(res, null, 'Coupon deleted'); });

// Public: check a code before placing order
const check = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.query;
  const { coupon, discountAmount } = await svc.applyToOrder(code, Number(subtotal));
  success(res, { coupon_id: coupon.coupon_id, code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value, discountAmount });
});

module.exports = { list, create, update, remove, check };
