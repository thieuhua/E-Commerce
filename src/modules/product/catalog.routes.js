const router = require('express').Router();
const { Category, Brand } = require('../product/product.model');
const { verifyToken, requireRole } = require('../../middlewares/auth');
const { asyncHandler, ApiError } = require('../../utils/apiError');
const { success, created } = require('../../utils/apiResponse');
const Joi = require('joi');
const validate = require('../../middlewares/validate');

const catSchema = Joi.object({
  name:        Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  parent_id:   Joi.number().integer().positive().optional(),
});
const brandSchema = Joi.object({
  name:        Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
});

// ── Categories ─────────────────────────────────────────────
const listCats = asyncHandler(async (req, res) => {
  const cats = await Category.findAll({
    where: { parent_id: null }, // top-level only
    include: [{ model: Category, as: 'children', attributes: ['category_id', 'name'] }],
    order: [['name', 'ASC']],
  });
  success(res, cats);
});

const createCat = asyncHandler(async (req, res) => {
  created(res, await Category.create(req.body));
});

const updateCat = asyncHandler(async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  success(res, await cat.update(req.body));
});

const removeCat = asyncHandler(async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) throw ApiError.notFound('Category not found');
  await cat.destroy();
  success(res, null, 'Category deleted');
});

router.get('/categories',      listCats);
router.post('/categories',     verifyToken, requireRole('admin'), validate(catSchema), createCat);
router.patch('/categories/:id', verifyToken, requireRole('admin'), validate(catSchema.fork(['name'], f => f.optional())), updateCat);
router.delete('/categories/:id', verifyToken, requireRole('admin'), removeCat);

// ── Brands ────────────────────────────────────────────────
const listBrands = asyncHandler(async (req, res) =>
  success(res, await Brand.findAll({ order: [['name', 'ASC']] })));

const createBrand = asyncHandler(async (req, res) =>
  created(res, await Brand.create(req.body)));

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) throw ApiError.notFound('Brand not found');
  success(res, await brand.update(req.body));
});

const removeBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByPk(req.params.id);
  if (!brand) throw ApiError.notFound('Brand not found');
  await brand.destroy();
  success(res, null, 'Brand deleted');
});

router.get('/brands',       listBrands);
router.post('/brands',      verifyToken, requireRole('admin'), validate(brandSchema), createBrand);
router.patch('/brands/:id', verifyToken, requireRole('admin'), validate(brandSchema.fork(['name'], f => f.optional())), updateBrand);
router.delete('/brands/:id', verifyToken, requireRole('admin'), removeBrand);

module.exports = router;
