import { getDbConnection } from '../utils/db.js';
import { getSQSClient } from '../utils/aws-clients.js';
import * as inboxRepo from '../repositories/inboxRepository.js';
import { logger } from '../utils/logger.js';

export const handler = async (event) => {
  const pool = await getDbConnection();
  const client = await pool.connect();
  const sqs = getSQSClient();

  for (const record of event.Records) {
    let messageBody;
    try {
      messageBody = JSON.parse(record.body);
    } catch (e) {
      logger.error('Failed to parse SQS message body', { body: record.body });
      continue;
    }

    // Detail is typically wrapped by EventBridge
    const detail = messageBody.detail || messageBody;
    const { event_type, payload, idempotency_key } = detail;
    const source = messageBody.source || 'unknown';

    if (!idempotency_key) {
      logger.warn('Missing idempotency key in inbox event', { messageId: record.messageId });
      continue;
    }

    try {
      await client.query('BEGIN');
      
      const existing = await inboxRepo.getInboxEventByIdempotencyKey(client, idempotency_key);
      if (existing) {
        logger.info('Inbox event already processed', { idempotency_key });
        await client.query('COMMIT');
        continue;
      }

      await inboxRepo.createInboxEvent(client, source, event_type, payload, idempotency_key);

      // Simple routing based on event_type
      switch (event_type) {
        case 'shelter.resident.created':
          // Insert into shelter_person_cache, trigger matching...
          logger.info('Processed shelter.resident.created');
          break;
        case 'incident.updated':
          logger.info('Processed incident.updated');
          break;
        default:
          logger.info('Unhandled event type', { event_type });
      }

      await inboxRepo.markInboxEventProcessed(client, idempotency_key);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process inbox event', { idempotency_key, error: error.message });
      // We do not handle retries via DB for inbox events, we throw to let SQS retry
      throw error; 
    }
  }
};
