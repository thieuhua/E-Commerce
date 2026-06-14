// controller
const svc = require('./cart.service');
const { success } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const get        = asyncHandler(async (req, res) => success(res, await svc.getOrCreate(req.user.userId)));
const addItem    = asyncHandler(async (req, res) => success(res, await svc.addItem(req.user.userId, req.body)));
const updateItem = asyncHandler(async (req, res) => success(res, await svc.updateItem(req.user.userId, req.params.itemId, req.body.quantity)));
const removeItem = asyncHandler(async (req, res) => success(res, await svc.removeItem(req.user.userId, req.params.itemId)));
const clear      = asyncHandler(async (req, res) => { await svc.clear(req.user.userId); success(res, null, 'Cart cleared'); });

module.exports = { get, addItem, updateItem, removeItem, clear };
