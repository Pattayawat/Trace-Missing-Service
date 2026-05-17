import { getDbConnection } from '../utils/db.js';

export const createReport = async (reportData) => {
  const db = getDbConnection();
  const query = `
    INSERT INTO missing_reports (reporter_id, incident_id, details, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING *
  `;
  const values = [reportData.userId, reportData.incidentId, reportData.details];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getReports = async () => {
  const db = getDbConnection();
  const { rows } = await db.query('SELECT * FROM missing_reports ORDER BY created_at DESC');
  return rows;
};

export const getIncidents = async () => {
  const db = getDbConnection();
  const { rows } = await db.query('SELECT * FROM incidents ORDER BY created_at DESC');
  return rows;
};

export const getReportById = async (id) => {
  const db = getDbConnection();
  const { rows } = await db.query('SELECT * FROM missing_reports WHERE id = $1', [id]);
  return rows[0];
};
