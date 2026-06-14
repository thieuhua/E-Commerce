const productService = require('./product.service');
const { success, created, paginated } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const list = asyncHandler(async (req, res) => {
  const { data, pagination } = await productService.list(req.query);
  paginated(res, data, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  success(res, product);
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.files || []);
  created(res, product);
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.files || []);
  success(res, product);
});

const remove = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  success(res, null, 'Product deleted');
});

const deleteImage = asyncHandler(async (req, res) => {
  await productService.deleteImage(req.params.imageId, req.params.id);
  success(res, null, 'Image deleted');
});

module.exports = { list, getById, create, update, remove, deleteImage };
