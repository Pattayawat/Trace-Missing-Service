import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config/index.js';
import { logger } from './logger.js';

let pool;

export const getDbConnection = async () => {
  if (!pool) {
    pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      max: 20, // Lambda should keep pool small or use RDS proxy
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', { error: err.message });
      process.exit(-1);
    });
  }
  return pool;
};
