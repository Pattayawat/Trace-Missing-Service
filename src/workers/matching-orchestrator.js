import { getDbConnection } from '../utils/db.js';
import { getSQSClient } from '../utils/aws-clients.js';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config/index.js';
import * as matchRepo from '../repositories/matchRepository.js';
import { logger } from '../utils/logger.js';

export const handler = async (event) => {
  const pool = await getDbConnection();
  const client = await pool.connect();
  const sqs = getSQSClient();

  for (const record of event.Records) {
    const { jobId, caseId, personId, methods } = JSON.parse(record.body);
    logger.info('Processing matching job', { jobId, caseId, personId });

    try {
      await client.query('BEGIN');
      await matchRepo.updateMatchingJobStatus(client, jobId, 'processing');

      // Rule-based matching executed directly
      if (methods.includes('rule_based')) {
        const candidates = await matchRepo.getShelterPersonMatchRuleBased(client, personId);
        for (const candidate of candidates) {
          await matchRepo.upsertMatchingResult(client, {
            personId,
            caseId,
            shelterId: candidate.shelter_id,
            shelterResidentId: candidate.resident_id,
            matchScore: candidate.score,
            matchMethod: 'rule_based',
            matchedFields: {},
            idempotencyKey: `rule-${caseId}-${candidate.resident_id}`
          });
        }
      }

      // Delegate face recognition to its own queue
      if (methods.includes('face_recognition')) {
        await sqs.send(new SendMessageCommand({
          QueueUrl: config.aws.sqs.faceRecognitionQueue,
          MessageBody: JSON.stringify({ jobId, caseId, personId }),
        }));
      }

      await matchRepo.updateMatchingJobStatus(client, jobId, 'completed');
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to process matching job', { jobId, error: error.message });
      throw error; // Let SQS retry
    }
  }
  
  client.release();
};
