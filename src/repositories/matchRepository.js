import { getDbConnection } from '../utils/db.js';

export const createMatchingJob = async (client, caseId, personId, methods) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO matching_jobs (case_id, person_id, status, methods)
    VALUES ($1, $2, 'queued', $3)
    RETURNING *
  `;
  const { rows } = await db.query(query, [caseId, personId, JSON.stringify(methods)]);
  return rows[0];
};

export const updateMatchingJobStatus = async (client, jobId, status) => {
  const db = client || await getDbConnection();
  const query = `UPDATE matching_jobs SET status=$1, updated_at=NOW() WHERE id=$2`;
  await db.query(query, [status, jobId]);
};

export const getShelterPersonMatchRuleBased = async (client, personId) => {
  const db = client || await getDbConnection();
  const query = `
    SELECT * FROM (
      SELECT spc.*, 
        CASE 
          WHEN p.citizen_id IS NOT NULL AND spc.citizen_id IS NOT NULL AND p.citizen_id = spc.citizen_id THEN 1.0
          WHEN p.first_name ILIKE spc.first_name AND p.last_name ILIKE spc.last_name THEN 0.9
          ELSE 0 
        END AS score
      FROM persons p
      JOIN shelter_person_cache spc ON spc.is_active = true
      WHERE p.id = $1
    ) sub
    WHERE score > 0.5
    ORDER BY score DESC
  `;
  const { rows } = await db.query(query, [personId]);
  return rows;
};

export const upsertMatchingResult = async (client, resultData) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO matching_results
      (person_id, case_id, shelter_id, shelter_resident_id, match_score, match_method, matched_fields, status, idempotency_key)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING *
  `;
  const values = [
    resultData.personId, resultData.caseId, resultData.shelterId, resultData.shelterResidentId,
    resultData.matchScore, resultData.matchMethod, JSON.stringify(resultData.matchedFields || {}),
    resultData.idempotencyKey
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};
