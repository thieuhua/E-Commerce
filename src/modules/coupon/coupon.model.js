const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Coupon = sequelize.define('Coupon', {
  coupon_id:       { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:            { type: DataTypes.STRING(50),  allowNull: false, unique: true },
  discount_type:   { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false },
  discount_value:  { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  min_order_amount:{ type: DataTypes.DECIMAL(15, 0), allowNull: true },
  start_date:      { type: DataTypes.DATEONLY, allowNull: false },
  end_date:        { type: DataTypes.DATEONLY, allowNull: false },
  quantity:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
  used_count:      { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  status:          { type: DataTypes.ENUM('active', 'inactive', 'expired'), defaultValue: 'active' },
}, { tableName: 'Coupon', timestamps: false });

module.exports = Coupon;
