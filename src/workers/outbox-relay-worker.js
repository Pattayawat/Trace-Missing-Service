import { getDbConnection } from '../utils/db.js';
import { getEventBridgeClient } from '../utils/aws-clients.js';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import * as outboxRepo from '../repositories/outboxRepository.js';

export const handler = async (event) => {
  const pool = await getDbConnection();
  const client = await pool.connect();
  const eventBridge = getEventBridgeClient();
  
  try {
    await client.query('BEGIN');

    // Lock and get pending events
    const rows = await outboxRepo.getPendingOutboxEvents(client, 10);

    for (const outboxEvent of rows) {
      try {
        await eventBridge.send(new PutEventsCommand({
          Entries: [{
            Source: 'trace-missing-service',
            DetailType: outboxEvent.event_type,
            Detail: JSON.stringify(outboxEvent.payload),
            EventBusName: config.aws.eventBusName,
          }]
        }));

        await outboxRepo.markOutboxEventPublished(client, outboxEvent.id);
        logger.info('Outbox event published', { eventId: outboxEvent.id, eventType: outboxEvent.event_type });
      } catch (err) {
        logger.error('Failed to publish outbox event', { eventId: outboxEvent.id, error: err.message });
        await outboxRepo.markOutboxEventFailed(client, outboxEvent.id);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Outbox relay worker failed', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};
