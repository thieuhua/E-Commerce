const Shipment = require('./shipment.model');
const { Order } = require('../order/order.model');
const { ApiError } = require('../../utils/apiError');
const { sequelize } = require('../../config/database');

// Valid status transitions
const TRANSITIONS = {
  preparing:  ['picked_up', 'returned'],
  picked_up:  ['in_transit', 'failed'],
  in_transit: ['delivered', 'failed'],
  delivered:  [],
  failed:     ['in_transit', 'returned'],
  returned:   [],
};

const getByOrder = async (orderId, userId, isAdmin = false) => {
  const orderWhere = { order_id: orderId };
  if (!isAdmin) orderWhere.user_id = userId;
  const order = await Order.findOne({ where: orderWhere });
  if (!order) throw ApiError.notFound('Order not found');

  const shipment = await Shipment.findOne({ where: { order_id: orderId } });
  if (!shipment) throw ApiError.notFound('Shipment not yet created for this order');
  return shipment;
};

// Admin creates shipment when order moves to processing
const create = async (orderId, { tracking_code, carrier }) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (!['confirmed', 'processing'].includes(order.status))
    throw ApiError.badRequest('Order must be confirmed before creating shipment');

  const exists = await Shipment.findOne({ where: { order_id: orderId } });
  if (exists) throw ApiError.conflict('Shipment already exists for this order');

  const t = await sequelize.transaction();
  try {
    const shipment = await Shipment.create(
      { order_id: orderId, tracking_code, carrier, status: 'preparing' },
      { transaction: t }
    );
    await Order.update({ status: 'processing' }, { where: { order_id: orderId }, transaction: t });
    await t.commit();
    return shipment;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const updateStatus = async (shipmentId, newStatus, { tracking_code, carrier } = {}) => {
  const shipment = await Shipment.findByPk(shipmentId);
  if (!shipment) throw ApiError.notFound('Shipment not found');

  const allowed = TRANSITIONS[shipment.status] || [];
  if (!allowed.includes(newStatus))
    throw ApiError.badRequest(`Cannot transition from "${shipment.status}" to "${newStatus}"`);

  const update = { status: newStatus };
  if (tracking_code) update.tracking_code = tracking_code;
  if (carrier)       update.carrier = carrier;
  if (newStatus === 'picked_up' || newStatus === 'in_transit') update.shipped_at = update.shipped_at || new Date();
  if (newStatus === 'delivered') update.delivered_at = new Date();

  const t = await sequelize.transaction();
  try {
    await shipment.update(update, { transaction: t });

    // Sync order status
    const orderStatusMap = {
      in_transit: 'shipping',
      delivered:  'delivered',
    };
    if (orderStatusMap[newStatus]) {
      await Order.update(
        { status: orderStatusMap[newStatus] },
        { where: { order_id: shipment.order_id }, transaction: t }
      );
    }
    await t.commit();
    return shipment.reload();
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = { getByOrder, create, updateStatus };
