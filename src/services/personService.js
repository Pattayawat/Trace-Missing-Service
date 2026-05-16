import { getDbConnection } from '../utils/db.js';
import * as personRepo from '../repositories/personRepository.js';
import * as outboxRepo from '../repositories/outboxRepository.js';
import { getS3Client } from '../utils/aws-clients.js';
import { config } from '../config/index.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger.js';

export const registerPerson = async (personData, correlationId) => {
  const pool = await getDbConnection();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const person = await personRepo.createPerson(client, personData);

    await outboxRepo.createOutboxEvent(
      client,
      'persons',
      person.id,
      'missing.person.registered',
      { personId: person.id, caseId: person.case_id },
      correlationId
    );

    await client.query('COMMIT');
    return person;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Failed to register person', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
};

export const generatePhotoUploadUrl = async (personId, correlationId) => {
  const s3Client = getS3Client();
  const fileExtension = 'jpg'; // Could be dynamic
  const filePath = `persons/${personId}/${Date.now()}.${fileExtension}`;
  
  const command = new PutObjectCommand({
    Bucket: config.aws.s3BucketPhotos,
    Key: filePath,
    ContentType: 'image/jpeg',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  const pool = await getDbConnection();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const photo = await personRepo.createPersonPhoto(client, personId, filePath, false);
    await client.query('COMMIT');
    
    return { uploadUrl, photoId: photo.id, filePath };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
