const svc = require('./user.service');
const { success, paginated } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const getProfile     = asyncHandler(async (req, res) => success(res, await svc.getProfile(req.user.userId)));
const updateProfile  = asyncHandler(async (req, res) => success(res, await svc.updateProfile(req.user.userId, req.body)));
const changePassword = asyncHandler(async (req, res) => { await svc.changePassword(req.user.userId, req.body); success(res, null, 'Password changed'); });

// Admin
const listAll = asyncHandler(async (req, res) => {
  const { count, rows } = await svc.listAll(req.query);
  paginated(res, rows, { total: count, page: Number(req.query.page || 1), limit: Number(req.query.limit || 20) });
});
const setRole = asyncHandler(async (req, res) => success(res, await svc.setRole(req.params.id, req.body.role)));

module.exports = { getProfile, updateProfile, changePassword, listAll, setRole };
