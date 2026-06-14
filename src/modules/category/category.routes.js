const express = require('express');
const router = express.Router();

const categoryController = require('./category.controller');
const validate = require('../../middlewares/validate');
const { verifyToken, requireRole } = require('../../middlewares/auth');
const {
  createCategorySchema,
  updateCategorySchema
} = require('./category.schema');

router.route('/')
  .get(categoryController.getAllCategories)
  .post(
    verifyToken,
    requireRole('admin', 'staff'),
    validate(createCategorySchema),
    categoryController.createCategory
  );

router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(
    verifyToken,
    requireRole('admin', 'staff'),
    validate(updateCategorySchema),
    categoryController.updateCategory
  )
  .delete(
    verifyToken,
    requireRole('admin'),
    categoryController.deleteCategory
  );

module.exports = router;