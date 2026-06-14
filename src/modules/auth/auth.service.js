const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/apiError');
const { getRedis } = require('../../config/redis');
const User = require('./user.model');

const SALT_ROUNDS = 12;

const generateTokens = (user) => {
  const payload = { userId: user.user_id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

  return { accessToken, refreshToken };
};

const register = async ({ username, email, password, full_name, phone }) => {
  const exists = await User.findOne({ where: { email } });
  if (exists) throw ApiError.conflict('Email already registered');

  const usernameExists = await User.findOne({ where: { username } });
  if (usernameExists) throw ApiError.conflict('Username already taken');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, password_hash, full_name, phone });

  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token in Redis (TTL = 7 days)
  const redis = getRedis();
  await redis.setEx(`rt:${user.user_id}`, 7 * 24 * 3600, refreshToken);

  return {
    user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const { accessToken, refreshToken } = generateTokens(user);

  const redis = getRedis();
  await redis.setEx(`rt:${user.user_id}`, 7 * 24 * 3600, refreshToken);

  return {
    user: { user_id: user.user_id, username: user.username, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const redis = getRedis();
  const stored = await redis.get(`rt:${decoded.userId}`);
  if (stored !== refreshToken) throw ApiError.unauthorized('Refresh token reuse detected');

  const user = await User.findByPk(decoded.userId);
  if (!user) throw ApiError.unauthorized();

  const tokens = generateTokens(user);
  await redis.setEx(`rt:${user.user_id}`, 7 * 24 * 3600, tokens.refreshToken);

  return tokens;
};

const logout = async (accessToken, userId) => {
  // Decode to get remaining TTL
  const decoded = jwt.decode(accessToken);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);

  const redis = getRedis();
  if (ttl > 0) await redis.setEx(`bl:${accessToken}`, ttl, '1'); // blacklist access token
  await redis.del(`rt:${userId}`); // remove refresh token
};

module.exports = { register, login, refresh, logout };
