const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('../../utils/apiError');
const { Product, Category, Brand, ProductImage } = require('./product.model');

const PRODUCT_INCLUDE = [
  { model: Category, as: 'category', attributes: ['category_id', 'name'] },
  { model: Brand,    as: 'brand',    attributes: ['brand_id', 'name'] },
  { model: ProductImage, as: 'images', attributes: ['image_id', 'image_url', 'sort_order'],
    separate: true, order: [['sort_order', 'ASC']] },
];

const list = async ({ page, limit, category_id, brand_id, status, search, sort_by, order, min_price, max_price }) => {
  const where = {};

  if (category_id) where.category_id = category_id;
  if (brand_id)    where.brand_id    = brand_id;
  if (status)      where.status      = status;
  if (min_price !== undefined || max_price !== undefined) {
    where.price = {};
    if (min_price !== undefined) where.price[Op.gte] = min_price;
    if (max_price !== undefined) where.price[Op.lte] = max_price;
  }
  if (search) {
    where[Op.or] = [
      { name:        { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await Product.findAndCountAll({
    where,
    include: PRODUCT_INCLUDE,
    order: [[sort_by, order.toUpperCase()]],
    limit,
    offset,
    distinct: true,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getById = async (product_id) => {
  const product = await Product.findByPk(product_id, { include: PRODUCT_INCLUDE });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const create = async (data, files = []) => {
  const category = await Category.findByPk(data.category_id);
  if (!category) throw ApiError.notFound('Category not found');

  const brand = await Brand.findByPk(data.brand_id);
  if (!brand) throw ApiError.notFound('Brand not found');

  const product = await Product.create(data);

  if (files.length) {
    const images = files.map((f, i) => ({
      product_id: product.product_id,
      image_url:  `/uploads/${f.filename}`,
      sort_order: i,
    }));
    await ProductImage.bulkCreate(images);
  }

  return getById(product.product_id);
};

const update = async (product_id, data, files = []) => {
  const product = await Product.findByPk(product_id);
  if (!product) throw ApiError.notFound('Product not found');

  await product.update(data);

  if (files.length) {
    // Append new images (don't delete existing ones)
    const currentMax = await ProductImage.max('sort_order', { where: { product_id } }) ?? -1;
    const images = files.map((f, i) => ({
      product_id,
      image_url:  `/uploads/${f.filename}`,
      sort_order: currentMax + 1 + i,
    }));
    await ProductImage.bulkCreate(images);
  }

  return getById(product_id);
};

const remove = async (product_id) => {
  const product = await Product.findByPk(product_id, {
    include: [{ model: ProductImage, as: 'images' }],
  });
  if (!product) throw ApiError.notFound('Product not found');

  // Delete image files from disk
  for (const img of product.images) {
    const filePath = path.join(process.cwd(), img.image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await product.destroy();
};

const deleteImage = async (image_id, product_id) => {
  const image = await ProductImage.findOne({ where: { image_id, product_id } });
  if (!image) throw ApiError.notFound('Image not found');

  const filePath = path.join(process.cwd(), image.image_url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await image.destroy();
};

module.exports = { list, getById, create, update, remove, deleteImage };
