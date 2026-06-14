const { sequelize } = require('../../config/database');
const Review = require('./review.model');
const { Order, OrderItem } = require('../order/order.model');
const { Product } = require('../product/product.model');
const User = require('../auth/user.model');
const { ApiError } = require('../../utils/apiError');

const REVIEW_INCLUDE = [{
  model: User,
  attributes: ['user_id', 'username', 'full_name'],
}];

// Verify user actually bought and received the product
const verifyPurchase = async (userId, productId) => {
  const purchased = await OrderItem.findOne({
    where: { product_id: productId },
    include: [{
      model: Order,
      where: { user_id: userId, status: 'delivered' },
      required: true,
    }],
  });
  if (!purchased) throw ApiError.forbidden('You can only review products you have purchased and received');
};

const listByProduct = async (productId, { page = 1, limit = 10 } = {}) => {
  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const { count, rows } = await Review.findAndCountAll({
    where: { product_id: productId },
    include: REVIEW_INCLUDE,
    order: [['created_at', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  // Compute rating breakdown
  const all = await Review.findAll({ where: { product_id: productId }, attributes: ['rating'] });
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  all.forEach((r) => breakdown[r.rating]++);
  const avg = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1) : null;

  return { data: rows, pagination: { total: count, page, limit }, summary: { avg_rating: avg, breakdown } };
};

const create = async (userId, productId, { rating, comment }) => {
  await verifyPurchase(userId, productId);

  const exists = await Review.findOne({ where: { user_id: userId, product_id: productId } });
  if (exists) throw ApiError.conflict('You have already reviewed this product');

  const product = await Product.findByPk(productId);
  if (!product) throw ApiError.notFound('Product not found');

  return Review.create({ user_id: userId, product_id: productId, rating, comment });
};

const update = async (reviewId, userId, { rating, comment }) => {
  const review = await Review.findOne({ where: { review_id: reviewId, user_id: userId } });
  if (!review) throw ApiError.notFound('Review not found');
  return review.update({ rating, comment });
};

const remove = async (reviewId, userId, isAdmin = false) => {
  const where = { review_id: reviewId };
  if (!isAdmin) where.user_id = userId;
  const review = await Review.findOne({ where });
  if (!review) throw ApiError.notFound('Review not found');
  await review.destroy();
};

module.exports = { listByProduct, create, update, remove };
