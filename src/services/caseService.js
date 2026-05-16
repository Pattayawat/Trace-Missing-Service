import { getDbConnection } from '../utils/db.js';
import * as caseRepo from '../repositories/caseRepository.js';
import * as outboxRepo from '../repositories/outboxRepository.js';
import { logger } from '../utils/logger.js';

export const updateCaseStatus = async (caseId, status, correlationId) => {
  const pool = await getDbConnection();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const updatedCase = await caseRepo.updateCaseStatus(client, caseId, status);
    
    if (!updatedCase) {
      throw new Error(`Case ${caseId} not found`);
    }

    await outboxRepo.createOutboxEvent(
      client,
      'cases',
      caseId,
      'missing.case.status_updated',
      { caseId, oldStatus: null, newStatus: status }, // Should get oldStatus in real scenario
      correlationId
    );

    await client.query('COMMIT');
    return updatedCase;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Failed to update case status', { error: err.message, caseId });
    throw err;
  } finally {
    client.release();
  }
};

export const getCaseDetails = async (caseId) => {
  const caseData = await caseRepo.getCaseById(null, caseId);
  return caseData;
};
