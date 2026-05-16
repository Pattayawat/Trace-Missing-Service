import { getDbConnection } from '../utils/db.js';

export const getInboxEventByIdempotencyKey = async (client, idempotencyKey) => {
  const db = client || await getDbConnection();
  const query = `SELECT id, status FROM inbox_events WHERE idempotency_key=$1`;
  const { rows } = await db.query(query, [idempotencyKey]);
  return rows[0];
};

export const createInboxEvent = async (client, sourceService, eventType, payload, idempotencyKey) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO inbox_events (source_service, event_type, payload, idempotency_key, status)
    VALUES ($1, $2, $3, $4, 'processing')
    RETURNING id
  `;
  const values = [sourceService, eventType, JSON.stringify(payload), idempotencyKey];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const markInboxEventProcessed = async (client, idempotencyKey) => {
  const db = client || await getDbConnection();
  const query = `UPDATE inbox_events SET status='processed', processed_at=NOW() WHERE idempotency_key=$1`;
  await db.query(query, [idempotencyKey]);
};

export const markInboxEventFailed = async (client, idempotencyKey) => {
  const db = client || await getDbConnection();
  const query = `UPDATE inbox_events SET status='failed' WHERE idempotency_key=$1`;
  await db.query(query, [idempotencyKey]);
};
