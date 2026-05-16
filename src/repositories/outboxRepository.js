import { getDbConnection } from '../utils/db.js';

export const createOutboxEvent = async (client, aggregateType, aggregateId, eventType, payload, correlationId) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload, correlation_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const values = [aggregateType, aggregateId, eventType, JSON.stringify(payload), correlationId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getPendingOutboxEvents = async (client, limit = 10) => {
  const db = client || await getDbConnection();
  const query = `
    SELECT * FROM outbox_events
    WHERE status = 'pending' AND next_retry_at <= NOW()
    ORDER BY created_at ASC
    LIMIT $1
    FOR UPDATE SKIP LOCKED
  `;
  const { rows } = await db.query(query, [limit]);
  return rows;
};

export const markOutboxEventPublished = async (client, id) => {
  const db = client || await getDbConnection();
  const query = `UPDATE outbox_events SET status='published', published_at=NOW() WHERE id=$1`;
  await db.query(query, [id]);
};

export const markOutboxEventFailed = async (client, id) => {
  const db = client || await getDbConnection();
  const query = `
    UPDATE outbox_events 
    SET status='failed', attempts=attempts+1, next_retry_at=NOW() + INTERVAL '1 minute' * attempts 
    WHERE id=$1
  `;
  await db.query(query, [id]);
};
