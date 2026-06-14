const categoryService = require('./category.service');
const { success, created } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const createCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.createCategory(req.body);
  created(res, result, 'Category created successfully');
});

const getAllCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getAllCategories();
  success(res, result);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const result = await categoryService.getCategoryById(req.params.id);
  success(res, result);
});

const updateCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.updateCategory(req.params.id, req.body);
  success(res, result, 'Category updated successfully');
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  success(res, null, 'Category deleted successfully');
});

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };