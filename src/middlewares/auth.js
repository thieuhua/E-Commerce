const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const { getRedis } = require('../config/redis');

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized();

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // Check if token was explicitly revoked (logout)
  const redis = getRedis();
  const revoked = await redis.get(`bl:${token}`);
  if (revoked) throw ApiError.unauthorized('Token revoked');

  req.user = decoded; // { userId, role }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) throw ApiError.forbidden();
  next();
};

module.exports = { verifyToken, requireRole };
