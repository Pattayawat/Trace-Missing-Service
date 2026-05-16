import { getDbConnection } from '../utils/db.js';

export const createReport = async (client, reportData) => {
  const db = client || await getDbConnection();
  const query = `
    INSERT INTO missing_reports (reporter_id, incident_id, details)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [reportData.reporterId, reportData.incidentId, reportData.details];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getReportById = async (client, id) => {
  const db = client || await getDbConnection();
  const query = `SELECT * FROM missing_reports WHERE id=$1 AND deleted_at IS NULL`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};
