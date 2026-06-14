const authService = require('./auth.service');
const { success, created } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result, 'Registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result, 'Login successful');
});

const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refresh_token);
  success(res, tokens);
});

const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await authService.logout(token, req.user.userId);
  success(res, null, 'Logged out');
});

const me = asyncHandler(async (req, res) => {
  success(res, req.user);
});

module.exports = { register, login, refresh, logout, me };
