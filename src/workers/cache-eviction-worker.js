import { getDbConnection } from '../utils/db.js';
import { logger } from '../utils/logger.js';

export const handler = async (event) => {
  const pool = await getDbConnection();
  const client = await pool.connect();
  
  try {
    // Triggered by EventBridge Scheduler
    logger.info('Running cache eviction worker');
    
    // Evict old cache records or set them inactive
    const query = `
      UPDATE shelter_person_cache
      SET is_active = false
      WHERE last_synced_at < NOW() - INTERVAL '30 days'
        AND is_active = true
    `;
    const { rowCount } = await client.query(query);
    logger.info(`Evicted ${rowCount} inactive shelter person cache records`);
    
  } catch (error) {
    logger.error('Cache eviction failed', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};
