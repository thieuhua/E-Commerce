const { sequelize } = require('../../config/database');
const { Order, OrderItem } = require('./order.model');
const { Cart, CartItem } = require('../cart/cart.model');
const { Product } = require('../product/product.model');
const Address = require('../address/address.model');
const couponSvc = require('../coupon/coupon.service');
const { ApiError } = require('../../utils/apiError');

const SHIPPING_FEE = 30000; // flat rate, đồ án đơn giản

const ORDER_INCLUDE = [{
  model: OrderItem,
  as: 'items',
  include: [{ model: Product, as: 'product', attributes: ['product_id', 'name', 'status'] }],
}];

const getById = async (orderId, userId, isAdmin = false) => {
  const where = { order_id: orderId };
  if (!isAdmin) where.user_id = userId;
  const order = await Order.findOne({ where, include: ORDER_INCLUDE });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

const listByUser = (userId) =>
  Order.findAll({ where: { user_id: userId }, include: ORDER_INCLUDE, order: [['order_date', 'DESC']] });

const listAll = ({ page = 1, limit = 20, status } = {}) => {
  const where = status ? { status } : {};
  return Order.findAndCountAll({
    where,
    include: ORDER_INCLUDE,
    order: [['order_date', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });
};

const create = async (userId, { address_id, coupon_code, note }) => {
  // 1. Validate address
  const address = await Address.findOne({ where: { address_id, user_id: userId } });
  if (!address) throw ApiError.notFound('Address not found');

  // 2. Load cart
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
  });
  if (!cart?.items?.length) throw ApiError.badRequest('Cart is empty');

  // 3. Validate stock for every item
  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.status !== 'active')
      throw ApiError.badRequest(`Product "${product?.name}" is not available`);
    if (product.stock_quantity < item.quantity)
      throw ApiError.badRequest(`Insufficient stock for "${product.name}"`);
  }

  // 4. Calculate subtotal
  const subtotal = cart.items.reduce((sum, i) => sum + i.quantity * Number(i.product.price), 0);

  // 5. Apply coupon
  let discountAmount = 0;
  let couponId = null;
  let couponDoc = null;
  if (coupon_code) {
    const result = await couponSvc.applyToOrder(coupon_code, subtotal);
    discountAmount = result.discountAmount;
    couponId = result.coupon.coupon_id;
    couponDoc = result.coupon;
  }

  const totalAmount = subtotal - discountAmount + SHIPPING_FEE;

  // 6. Persist everything in one transaction
  const t = await sequelize.transaction();
  try {
    const order = await Order.create({
      user_id: userId,
      address_id,
      coupon_id: couponId,
      subtotal,
      discount_amount: discountAmount,
      shipping_fee: SHIPPING_FEE,
      total_amount: totalAmount,
      note,
    }, { transaction: t });

    const orderItems = cart.items.map((i) => ({
      order_id:   order.order_id,
      product_id: i.product_id,
      quantity:   i.quantity,
      unit_price: Number(i.product.price),
      subtotal:   i.quantity * Number(i.product.price),
    }));
    await OrderItem.bulkCreate(orderItems, { transaction: t });

    // Deduct stock
    for (const i of cart.items) {
      await Product.decrement('stock_quantity', {
        by: i.quantity,
        where: { product_id: i.product_id },
        transaction: t,
      });
    }

    // Mark coupon as used
    if (couponId) await couponSvc.incrementUsed(couponId, t);

    // Clear cart
    await CartItem.destroy({ where: { cart_id: cart.cart_id }, transaction: t });

    await t.commit();
    return getById(order.order_id, userId);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const updateStatus = async (orderId, newStatus, userId, isAdmin = false) => {
  const order = await getById(orderId, userId, isAdmin);

  // Customers can only cancel pending orders
  if (!isAdmin) {
    if (newStatus !== 'cancelled') throw ApiError.forbidden();
    if (!['pending', 'confirmed'].includes(order.status))
      throw ApiError.badRequest('Order cannot be cancelled at this stage');
  }

  // Restore stock on cancellation
  if (newStatus === 'cancelled' && order.status !== 'cancelled') {
    const t = await sequelize.transaction();
    try {
      for (const item of order.items) {
        await Product.increment('stock_quantity', {
          by: item.quantity,
          where: { product_id: item.product_id },
          transaction: t,
        });
      }
      await order.update({ status: newStatus }, { transaction: t });
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } else {
    await order.update({ status: newStatus });
  }

  return order.reload({ include: ORDER_INCLUDE });
};

module.exports = { create, getById, listByUser, listAll, updateStatus };
