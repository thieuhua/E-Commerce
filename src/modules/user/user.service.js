const bcrypt = require('bcryptjs');
const User = require('../auth/user.model');
const { ApiError } = require('../../utils/apiError');

const SAFE_ATTRS = ['user_id', 'username', 'email', 'full_name', 'phone', 'role', 'created_at'];

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, { attributes: SAFE_ATTRS });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const updateProfile = async (userId, { full_name, phone }) => {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');
  await user.update({ full_name, phone });
  return User.findByPk(userId, { attributes: SAFE_ATTRS });
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');

  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  if (current_password === new_password)
    throw ApiError.badRequest('New password must differ from current password');

  const password_hash = await bcrypt.hash(new_password, 12);
  await user.update({ password_hash });
};

// Admin: list all users
const listAll = ({ page = 1, limit = 20, role, search } = {}) => {
  const { Op } = require('sequelize');
  const where = {};
  if (role) where.role = role;
  if (search) {
    where[Op.or] = [
      { username:  { [Op.like]: `%${search}%` } },
      { email:     { [Op.like]: `%${search}%` } },
      { full_name: { [Op.like]: `%${search}%` } },
    ];
  }
  return User.findAndCountAll({
    where,
    attributes: SAFE_ATTRS,
    order: [['created_at', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
};

// Admin: change a user's role
const setRole = async (userId, role) => {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');
  await user.update({ role });
  return User.findByPk(userId, { attributes: SAFE_ATTRS });
};

module.exports = { getProfile, updateProfile, changePassword, listAll, setRole };
