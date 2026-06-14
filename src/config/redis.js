const { createClient } = require('redis');

let redisClient;
const disabledRedis = {
    async get() {
        return null;
    },

    async setEx() {},

    async del() {}
};


const connectRedis = async () => {
    if (process.env.USE_REDIS !== 'true') {
        console.log('Redis disabled');
        return;
    }
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => console.error('Redis error:', err));

  await redisClient.connect();
  console.log('Redis connected');
};

const getRedis = () => {
  return redisClient || disabledRedis;
};

module.exports = { connectRedis, getRedis };
