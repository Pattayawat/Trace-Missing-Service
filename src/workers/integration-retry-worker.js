import { logger } from '../utils/logger.js';

export const handler = async (event) => {
  for (const record of event.Records) {
    logger.info('Processing integration retry', { messageId: record.messageId });
    try {
      // Logic to retry external API calls
      // e.g., call external service again based on payload
      // if successful, delete message (handled automatically by SQS if no error thrown)
      // if fail, throw error to let FIFO queue or DLQ handle it
    } catch (error) {
      logger.error('Integration retry failed', { error: error.message });
      throw error;
    }
  }
};
