import { getDbConnection } from '../utils/db.js';
import * as matchRepo from '../repositories/matchRepository.js';
import { getSQSClient } from '../utils/aws-clients.js';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export const triggerMatchingPipeline = async (caseId, personId, methods, correlationId) => {
  const pool = await getDbConnection();
  const client = await pool.connect();
  const sqs = getSQSClient();

  try {
    await client.query('BEGIN');
    
    const job = await matchRepo.createMatchingJob(client, caseId, personId, methods);

    await sqs.send(new SendMessageCommand({
      QueueUrl: config.aws.sqs.matchingJobsQueue,
      MessageBody: JSON.stringify({
        jobId: job.id,
        caseId,
        personId,
        methods
      }),
      MessageAttributes: {
        CorrelationId: { DataType: 'String', StringValue: correlationId }
      }
    }));

    await client.query('COMMIT');
    logger.info('Matching pipeline triggered', { jobId: job.id, caseId, personId });
    return job;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Failed to trigger matching pipeline', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
};
