const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { Product, ProductImage } = require('../product/product.model');

const Cart = sequelize.define('Cart', {
  cart_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'Cart', timestamps: false });

const CartItem = sequelize.define('CartItem', {
  cart_item_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  cart_id:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  product_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  quantity:     { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
}, { tableName: 'CartItem', timestamps: false });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart,    { foreignKey: 'cart_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem,   { foreignKey: 'product_id' });

module.exports = { Cart, CartItem };
