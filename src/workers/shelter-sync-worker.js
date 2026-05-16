import { getDbConnection } from '../utils/db.js';
import { logger } from '../utils/logger.js';

export const handler = async (event) => {
  const pool = await getDbConnection();
  const client = await pool.connect();
  
  try {
    // Logic to batch sync shelter records if needed,
    // though typically shelter_person_cache is updated via inbox events.
    logger.info('Running shelter sync worker');
  } catch (error) {
    logger.error('Shelter sync failed', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};
