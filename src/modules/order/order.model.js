const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { Product } = require('../product/product.model');

const Order = sequelize.define('Order', {
  order_id:        { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  address_id:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  coupon_id:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  order_date:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  subtotal:        { type: DataTypes.DECIMAL(15, 0), allowNull: false },
  discount_amount: { type: DataTypes.DECIMAL(15, 0), defaultValue: 0 },
  shipping_fee:    { type: DataTypes.DECIMAL(15, 0), defaultValue: 0 },
  total_amount:    { type: DataTypes.DECIMAL(15, 0), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  note: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'Order', timestamps: false });

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  order_id:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  product_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  quantity:      { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
  unit_price:    { type: DataTypes.DECIMAL(15, 0),    allowNull: false },
  subtotal:      { type: DataTypes.DECIMAL(15, 0),    allowNull: false },
}, { tableName: 'OrderItem', timestamps: false });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order,   { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = { Order, OrderItem };
