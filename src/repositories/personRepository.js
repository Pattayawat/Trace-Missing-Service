import { getDbConnection } from '../utils/db.js';

export const createPerson = async (client, personData) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO persons (case_id, full_name, gender, date_of_birth, physical_description, last_seen_location, last_seen_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [
    personData.caseId, personData.fullName, personData.gender, personData.dateOfBirth,
    personData.physicalDescription, personData.lastSeenLocation, personData.lastSeenDate
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const createPersonPhoto = async (client, personId, filePath, isPrimary = false) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO person_photos (person_id, file_path, status, is_primary)
    VALUES ($1, $2, 'pending', $3)
    RETURNING *
  `;
  const { rows } = await db.query(query, [personId, filePath, isPrimary]);
  return rows[0];
};

export const updatePersonPhotoEmbedding = async (client, photoId, embedding) => {
  const db = client || await getDbConnection();
  const query = `
    UPDATE person_photos 
    SET face_embedding=$1::vector, status='ready' 
    WHERE id=$2 
    RETURNING *
  `;
  // pgvector expects string representation like '[0.1, 0.2, ...]'
  const embeddingStr = `[${embedding.join(',')}]`;
  const { rows } = await db.query(query, [embeddingStr, photoId]);
  return rows[0];
};

export const getPersonPhotos = async (client, personId) => {
  const db = client || await getDbConnection();
  const query = `SELECT * FROM person_photos WHERE person_id=$1 AND deleted_at IS NULL ORDER BY is_primary DESC`;
  const { rows } = await db.query(query, [personId]);
  return rows;
};
