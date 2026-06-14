const svc = require('./shipment.service');
const { success, created } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const getByOrder   = asyncHandler(async (req, res) =>
  success(res, await svc.getByOrder(req.params.orderId, req.user.userId, req.user.role === 'admin')));

const create       = asyncHandler(async (req, res) =>
  created(res, await svc.create(req.params.orderId, req.body)));

const updateStatus = asyncHandler(async (req, res) =>
  success(res, await svc.updateStatus(req.params.shipmentId, req.body.status, req.body)));

module.exports = { getByOrder, create, updateStatus };
