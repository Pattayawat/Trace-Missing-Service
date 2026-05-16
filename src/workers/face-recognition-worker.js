import { getDbConnection } from '../utils/db.js';
import * as personRepo from '../repositories/personRepository.js';
import * as matchRepo from '../repositories/matchRepository.js';
import * as outboxRepo from '../repositories/outboxRepository.js';
import { logger } from '../utils/logger.js';

export const handler = async (event) => {
  const pool = await getDbConnection();
  const client = await pool.connect();

  for (const record of event.Records) {
    const { jobId, caseId, personId } = JSON.parse(record.body);
    logger.info('Processing face recognition matching', { jobId, caseId, personId });

    try {
      await client.query('BEGIN');

      const photos = await personRepo.getPersonPhotos(client, personId);
      const facePhoto = photos.find(p => p.face_embedding);

      if (!facePhoto) {
        logger.info('No face embedding found for person, skipping', { personId });
        await client.query('COMMIT');
        continue;
      }

      // pgvector similarity search
      const { rows: matches } = await client.query(`
        SELECT resident_id, shelter_id,
               1 - (face_embedding <=> $1::vector) AS similarity
        FROM shelter_person_cache
        WHERE face_embedding IS NOT NULL AND is_active = true
          AND 1 - (face_embedding <=> $1::vector) > 0.75
        ORDER BY similarity DESC
        LIMIT 20
      `, [facePhoto.face_embedding]);

      const highScoreMatches = [];

      for (const match of matches) {
        await matchRepo.upsertMatchingResult(client, {
          personId,
          caseId,
          shelterId: match.shelter_id,
          shelterResidentId: match.resident_id,
          matchScore: match.similarity,
          matchMethod: 'face_recognition',
          idempotencyKey: `face-${caseId}-${match.resident_id}`
        });

        if (match.similarity > 0.85) {
          highScoreMatches.push(match);
        }
      }

      // If high score match found, trigger notification via outbox
      if (highScoreMatches.length > 0) {
        await outboxRepo.createOutboxEvent(
          client,
          'matching_results',
          caseId,
          'missing.match.detected',
          { caseId, personId, matches: highScoreMatches },
          `face-match-${jobId}` // correlation ID
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Face recognition matching failed', { jobId, error: error.message });
      throw error;
    }
  }

  client.release();
};
