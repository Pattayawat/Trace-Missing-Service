import { getDbConnection } from '../utils/db.js';

export const createCase = async (client, caseData) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO cases (report_id, status, priority, assigned_officer_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [caseData.reportId, caseData.status || 'VERIFYING', caseData.priority || 'normal', caseData.assignedOfficerId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const updateCaseStatus = async (client, id, status) => {
  const db = client || await getDbConnection();
  const query = `UPDATE cases SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`;
  const { rows } = await db.query(query, [status, id]);
  return rows[0];
};

export const getCaseById = async (client, id) => {
  const db = client || await getDbConnection();
  const query = `SELECT * FROM cases WHERE id=$1`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};
