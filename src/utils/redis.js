import Redis from 'ioredis';
import { config } from '../config/index.js';
import { logger } from './logger.js';

let redisClient;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
    });
  }
  return redisClient;
};
