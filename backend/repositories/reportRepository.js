import { getDbConnection } from '../utils/db.js';

export const createReport = async (reportData) => {
  const db = getDbConnection();
  const query = `
    INSERT INTO missing_reports (
      reporter_id, incident_id, details, status, photo_url, location,
      is_unidentified, source, hospital_id, age_category, gender, life_status, first_name, last_name, age, report_type
    )
    VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `;
  const values = [
    reportData.userId || reportData.reporter_id, 
    reportData.incidentId || reportData.incident_id, 
    reportData.details, 
    reportData.photoUrl || reportData.photo_url, 
    reportData.location,
    reportData.isUnidentified || reportData.is_unidentified || false,
    reportData.source || null,
    reportData.hospitalId || reportData.hospital_id || null,
    reportData.ageCategory || reportData.age_category || null,
    reportData.gender || null,
    reportData.lifeStatus || reportData.life_status || null,
    reportData.firstName || reportData.first_name || null,
    reportData.lastName || reportData.last_name || null,
    reportData.age || null,
    reportData.reportType || reportData.report_type || 'missing-person'
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getReports = async (filters = {}) => {
  const db = getDbConnection();
  let query = 'SELECT * FROM missing_reports WHERE deleted_at IS NULL';
  const values = [];

  if (filters.incidentId) {
    values.push(filters.incidentId);
    query += ` AND incident_id = $${values.length}`;
  }

  if (filters.reportType) {
    values.push(filters.reportType);
    query += ` AND report_type = $${values.length}`;
  }

  query += ' ORDER BY created_at DESC';
  
  const { rows } = await db.query(query, values);
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
