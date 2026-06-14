const Payment = require('./payment.model');
const { Order } = require('../order/order.model');
const { ApiError } = require('../../utils/apiError');
const { sequelize } = require('../../config/database');

const getByOrder = async (orderId, userId, isAdmin = false) => {
  // Verify order ownership
  const where = { order_id: orderId };
  if (!isAdmin) where.user_id = userId;
  const order = await Order.findOne({ where });
  if (!order) throw ApiError.notFound('Order not found');
  return Payment.findAll({ where: { order_id: orderId }, order: [['payment_id', 'DESC']] });
};

// Called right after order creation — creates the first pending payment record
const initiate = async (orderId, method, userId) => {
  const order = await Order.findOne({ where: { order_id: orderId, user_id: userId } });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status === 'cancelled') throw ApiError.badRequest('Order is cancelled');

  return Payment.create({ order_id: orderId, method, amount: order.total_amount });
};

// COD: mark as paid when delivered (called by admin/shipment webhook)
// Bank/eWallet: called after verifying transaction_ref from payment gateway
const confirm = async (paymentId, { transaction_ref } = {}) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status === 'paid') throw ApiError.badRequest('Payment already confirmed');

  const t = await sequelize.transaction();
  try {
    await payment.update(
      { status: 'paid', transaction_ref: transaction_ref || null, paid_at: new Date() },
      { transaction: t }
    );
    // Auto-confirm the order when payment is received
    await Order.update(
      { status: 'confirmed' },
      { where: { order_id: payment.order_id, status: 'pending' }, transaction: t }
    );
    await t.commit();
    return payment.reload();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const markFailed = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  return payment.update({ status: 'failed' });
};

const refund = async (paymentId) => {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'paid') throw ApiError.badRequest('Only paid payments can be refunded');
  return payment.update({ status: 'refunded' });
};

module.exports = { getByOrder, initiate, confirm, markFailed, refund };
