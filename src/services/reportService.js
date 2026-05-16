import { getDbConnection } from '../utils/db.js';
import * as reportRepo from '../repositories/reportRepository.js';
import * as caseRepo from '../repositories/caseRepository.js';
import * as outboxRepo from '../repositories/outboxRepository.js';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

export const createMissingReport = async (reportData, userId, correlationId) => {
  const pool = await getDbConnection();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // 1. Create Report
    const report = await reportRepo.createReport(client, {
      ...reportData,
      reporterId: userId
    });

    // 2. Auto-create Case
    const caseRecord = await caseRepo.createCase(client, {
      reportId: report.id,
      status: 'investigating',
      priority: 'normal'
    });

    // 3. Write outbox event (Transactional Outbox)
    await outboxRepo.createOutboxEvent(
      client,
      'missing_reports',
      report.id,
      'missing.report.created',
      { reportId: report.id, caseId: caseRecord.id },
      correlationId
    );

    await client.query('COMMIT');
    logger.info('Missing report created successfully', { reportId: report.id, caseId: caseRecord.id });
    
    return { reportId: report.id, caseId: caseRecord.id };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Failed to create missing report', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
};
