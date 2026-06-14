const svc = require('./payment.service');
const { success, created } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const getByOrder = asyncHandler(async (req, res) =>
  success(res, await svc.getByOrder(req.params.orderId, req.user.userId, req.user.role === 'admin')));

const initiate = asyncHandler(async (req, res) =>
  created(res, await svc.initiate(req.params.orderId, req.body.method, req.user.userId)));

const confirm = asyncHandler(async (req, res) =>
  success(res, await svc.confirm(req.params.paymentId, req.body)));

const markFailed = asyncHandler(async (req, res) =>
  success(res, await svc.markFailed(req.params.paymentId)));

const refund = asyncHandler(async (req, res) =>
  success(res, await svc.refund(req.params.paymentId)));

module.exports = { getByOrder, initiate, confirm, markFailed, refund };
