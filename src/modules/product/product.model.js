const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Category = sequelize.define('Category', {
  category_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  parent_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { tableName: 'Category', timestamps: false });

Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
Category.hasMany(Category,   { as: 'children', foreignKey: 'parent_id' });

const Brand = sequelize.define('Brand', {
  brand_id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
}, { tableName: 'Brand', timestamps: false });

const Product = sequelize.define('Product', {
  product_id:     { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  category_id:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  brand_id:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name:           { type: DataTypes.STRING(255), allowNull: false },
  description:    { type: DataTypes.TEXT },
  price:          { type: DataTypes.DECIMAL(15, 0), allowNull: false },
  stock_quantity: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  status:         { type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'), defaultValue: 'active' },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'Product', timestamps: false });

const ProductImage = sequelize.define('ProductImage', {
  image_id:   { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  image_url:  { type: DataTypes.STRING(500), allowNull: false },
  sort_order: { type: DataTypes.SMALLINT, defaultValue: 0 },
}, { tableName: 'ProductImage', timestamps: false });

// Associations
Product.belongsTo(Category,    { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Brand,       { foreignKey: 'brand_id',    as: 'brand' });
Product.hasMany(ProductImage,  { foreignKey: 'product_id',  as: 'images', onDelete: 'CASCADE' });
Category.hasMany(Product,      { foreignKey: 'category_id' });
Brand.hasMany(Product,         { foreignKey: 'brand_id' });

module.exports = { Product, Category, Brand, ProductImage };
