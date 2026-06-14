const { Op } = require('sequelize');
const Coupon = require('./coupon.model');
const { ApiError } = require('../../utils/apiError');

// Validate and return discount amount — used by order service too
const applyToOrder = async (code, subtotal) => {
  const coupon = await Coupon.findOne({ where: { code, status: 'active' } });
  if (!coupon) throw ApiError.badRequest('Invalid or expired coupon code');

  const today = new Date().toISOString().slice(0, 10);
  if (today < coupon.start_date || today > coupon.end_date)
    throw ApiError.badRequest('Coupon is not valid at this time');

  if (coupon.used_count >= coupon.quantity)
    throw ApiError.badRequest('Coupon has been fully used');

  if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount))
    throw ApiError.badRequest(`Order must be at least ${coupon.min_order_amount} to use this coupon`);

  let discountAmount =
    coupon.discount_type === 'percent'
      ? Math.floor((subtotal * Number(coupon.discount_value)) / 100)
      : Number(coupon.discount_value);

  discountAmount = Math.min(discountAmount, subtotal); // can't discount more than order total

  return { coupon, discountAmount };
};

const incrementUsed = (couponId, transaction) =>
  Coupon.increment('used_count', { by: 1, where: { coupon_id: couponId }, transaction });

// Admin CRUD
const list = () => Coupon.findAll({ order: [['coupon_id', 'DESC']] });

const create = async (data) => {
  const exists = await Coupon.findOne({ where: { code: data.code } });
  if (exists) throw ApiError.conflict('Coupon code already exists');
  return Coupon.create(data);
};

const update = async (id, data) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return coupon.update(data);
};

const remove = async (id) => {
  const coupon = await Coupon.findByPk(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  await coupon.destroy();
};

module.exports = { applyToOrder, incrementUsed, list, create, update, remove };
