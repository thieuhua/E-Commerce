const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define(
  'User',
  {
    user_id:       { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    username:      { type: DataTypes.STRING(50),  allowNull: false, unique: true },
    email:         { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name:     { type: DataTypes.STRING(100), allowNull: false },
    phone:         { type: DataTypes.STRING(20),  allowNull: true },
    role:          { type: DataTypes.ENUM('customer', 'admin', 'staff'), defaultValue: 'customer' },
    created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'User',
    timestamps: false,
  }
);

module.exports = User;
