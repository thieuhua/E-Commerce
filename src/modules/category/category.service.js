const Category = require('./category.model');
const { ApiError } = require('../../utils/apiError');

const createCategory = async (data) => {
  if (data.parent_id) {
    const parentExists = await Category.findByPk(data.parent_id);
    if (!parentExists) throw ApiError.notFound('Parent category not found');
  }
  return await Category.create(data);
};

const getAllCategories = async () => {
  return await Category.findAll({
    include: [{ model: Category, as: 'SubCategories' }]
  });
};

const getCategoryById = async (id) => {
  const category = await Category.findByPk(id, {
    include: [{ model: Category, as: 'SubCategories' }, { model: Category, as: 'Parent' }]
  });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

const updateCategory = async (id, data) => {
  const category = await getCategoryById(id);
  if (data.parent_id && data.parent_id === parseInt(id)) {
    throw ApiError.badRequest('A category cannot be its own parent');
  }
  return await category.update(data);
};

const deleteCategory = async (id) => {
  const category = await getCategoryById(id);
  await category.destroy();
  return true;
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };