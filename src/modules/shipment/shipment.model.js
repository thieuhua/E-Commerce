const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Shipment = sequelize.define('Shipment', {
  shipment_id:   { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  order_id:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
  tracking_code: { type: DataTypes.STRING(100), allowNull: true },
  carrier:       { type: DataTypes.STRING(100), allowNull: true },
  status: {
    type: DataTypes.ENUM('preparing', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'),
    defaultValue: 'preparing',
  },
  shipped_at:    { type: DataTypes.DATE, allowNull: true },
  delivered_at:  { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'Shipment', timestamps: false });

module.exports = Shipment;
