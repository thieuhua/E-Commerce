const { Cart, CartItem } = require('./cart.model');
const { Product, ProductImage } = require('../product/product.model');
const { ApiError } = require('../../utils/apiError');

const CART_INCLUDE = [{
  model: CartItem,
  as: 'items',
  include: [{
    model: Product,
    as: 'product',
    attributes: ['product_id', 'name', 'price', 'stock_quantity', 'status'],
    include: [{
      model: ProductImage,
      as: 'images',
      attributes: ['image_url'],
      limit: 1,
      order: [['sort_order', 'ASC']],
    }],
  }],
}];

// Get or create cart for user
const getOrCreate = async (userId) => {
  let cart = await Cart.findOne({ where: { user_id: userId }, include: CART_INCLUDE });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
    cart = await Cart.findOne({ where: { user_id: userId }, include: CART_INCLUDE });
  }
  return enrichCart(cart);
};

const enrichCart = (cart) => {
  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + item.quantity * Number(item.product?.price || 0), 0);
  return { ...cart.toJSON(), total };
};

const addItem = async (userId, { product_id, quantity = 1 }) => {
  const product = await Product.findByPk(product_id);
  if (!product) throw ApiError.notFound('Product not found');
  if (product.status !== 'active') throw ApiError.badRequest('Product is not available');
  if (product.stock_quantity < quantity) throw ApiError.badRequest('Insufficient stock');

  let cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) cart = await Cart.create({ user_id: userId });

  const existing = await CartItem.findOne({ where: { cart_id: cart.cart_id, product_id } });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (product.stock_quantity < newQty) throw ApiError.badRequest('Insufficient stock');
    await existing.update({ quantity: newQty });
  } else {
    await CartItem.create({ cart_id: cart.cart_id, product_id, quantity });
  }

  return getOrCreate(userId);
};

const updateItem = async (userId, cartItemId, quantity) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = await CartItem.findOne({ where: { cart_item_id: cartItemId, cart_id: cart.cart_id } });
  if (!item) throw ApiError.notFound('Cart item not found');

  const product = await Product.findByPk(item.product_id);
  if (product.stock_quantity < quantity) throw ApiError.badRequest('Insufficient stock');

  await item.update({ quantity });
  return getOrCreate(userId);
};

const removeItem = async (userId, cartItemId) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = await CartItem.findOne({ where: { cart_item_id: cartItemId, cart_id: cart.cart_id } });
  if (!item) throw ApiError.notFound('Cart item not found');

  await item.destroy();
  return getOrCreate(userId);
};

const clear = async (userId) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (cart) await CartItem.destroy({ where: { cart_id: cart.cart_id } });
};

module.exports = { getOrCreate, addItem, updateItem, removeItem, clear };
