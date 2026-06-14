const svc = require('./address.service');
const { success, created } = require('../../utils/apiResponse');
const { asyncHandler } = require('../../utils/apiError');

const list       = asyncHandler(async (req, res) => success(res, await svc.list(req.user.userId)));
const getOne     = asyncHandler(async (req, res) => success(res, await svc.getOne(req.params.id, req.user.userId)));
const create     = asyncHandler(async (req, res) => created(res, await svc.create(req.user.userId, req.body)));
const update     = asyncHandler(async (req, res) => success(res, await svc.update(req.params.id, req.user.userId, req.body)));
const remove     = asyncHandler(async (req, res) => { await svc.remove(req.params.id, req.user.userId); success(res, null, 'Address deleted'); });
const setDefault = asyncHandler(async (req, res) => success(res, await svc.setDefault(req.params.id, req.user.userId)));

module.exports = { list, getOne, create, update, remove, setDefault };
