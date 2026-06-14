const svc = require('./review.service');
const { success, created, paginated } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const listByProduct = asyncHandler(async (req, res) => {
  const result = await svc.listByProduct(req.params.productId, req.query);
  res.json({ success: true, ...result });
});

const create = asyncHandler(async (req, res) =>
  created(res, await svc.create(req.user.userId, req.params.productId, req.body)));

const update = asyncHandler(async (req, res) =>
  success(res, await svc.update(req.params.reviewId, req.user.userId, req.body)));

const remove = asyncHandler(async (req, res) => {
  await svc.remove(req.params.reviewId, req.user.userId, req.user.role === 'admin');
  success(res, null, 'Review deleted');
});

module.exports = { listByProduct, create, update, remove };
