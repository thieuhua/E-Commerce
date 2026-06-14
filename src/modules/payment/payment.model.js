const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Payment = sequelize.define('Payment', {
  payment_id:      { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  order_id:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  method:          { type: DataTypes.ENUM('cod', 'bank_transfer', 'e_wallet', 'credit_card'), allowNull: false },
  amount:          { type: DataTypes.DECIMAL(15, 0), allowNull: false },
  status:          { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  transaction_ref: { type: DataTypes.STRING(100), allowNull: true },
  paid_at:         { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'Payment', timestamps: false });

module.exports = Payment;
