const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Category = sequelize.define(
  'Category',
  {
    category_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    parent_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  },
  {
    tableName: 'Category',
    timestamps: false,
  }
);

// Self-referencing association cho danh mục cha - con
Category.belongsTo(Category, { as: 'Parent', foreignKey: 'parent_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'parent_id' });

module.exports = Category;