const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Address = sequelize.define(
  'Address',
  {
    address_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiver_name: { type: DataTypes.STRING(100), allowNull: false },
    phone:         { type: DataTypes.STRING(20),  allowNull: false },
    province:      { type: DataTypes.STRING(100), allowNull: false },
    district:      { type: DataTypes.STRING(100), allowNull: false },
    ward:          { type: DataTypes.STRING(100), allowNull: false },
    detail:        { type: DataTypes.STRING(255), allowNull: false },
    is_default:    { type: DataTypes.TINYINT,     defaultValue: 0 },
  },
  { tableName: 'Address', timestamps: false }
);

module.exports = Address;
