import { getDbConnection } from '../utils/db.js';

export const createReport = async (reportData) => {
  const db = getDbConnection();
  const query = `
    INSERT INTO missing_reports (
      reporter_id, incident_id, details, status, photo_url, location,
      is_unidentified, source, hospital_id, age_category, gender, life_status, first_name, last_name, age, report_type,
      latitude, longitude, citizen_id
    )
    VALUES ($1, $2, $3, 'REPORTED', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
    reportData.reportType || reportData.report_type || 'missing-person',
    reportData.latitude || reportData.lat || null,
    reportData.longitude || reportData.long || null,
    reportData.citizenId || reportData.citizen_id || null
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

export const findReportByExternalId = async (externalId, source) => {
  const db = getDbConnection();
  const { rows } = await db.query(
    'SELECT * FROM missing_reports WHERE external_id = $1 AND source = $2 AND deleted_at IS NULL',
    [externalId, source]
  );
  return rows[0];
};

export const findReportByCitizenId = async (citizenId) => {
  const db = getDbConnection();
  // BUG FIX #2 & #3: When searching for potential matches or duplicates, 
  // we often specifically look for 'missing-person' type to avoid mixing with 'unidentified' ones.
  const { rows } = await db.query(
    'SELECT * FROM missing_reports WHERE citizen_id = $1 AND report_type = \'missing-person\' AND deleted_at IS NULL',
    [citizenId]
  );
  return rows[0];
};

export const findReportByNames = async (firstName, lastName) => {
  const db = getDbConnection();
  const { rows } = await db.query(
    'SELECT * FROM missing_reports WHERE first_name ILIKE $1 AND last_name ILIKE $2 AND report_type = \'missing-person\' AND deleted_at IS NULL',
    [firstName, lastName]
  );
  return rows[0];
};

export const findDuplicateReport = async (data) => {
  const db = getDbConnection();
  const reportType = data.reportType || data.report_type || 'missing-person';
  const citizenId = data.citizenId || data.citizen_id;
  
  // 1. Priority check by citizen_id (must scope to same report_type to prevent Cross-Type Duplicates)
  if (citizenId) {
    const { rows } = await db.query(
      'SELECT * FROM missing_reports WHERE citizen_id = $1 AND report_type = $2 AND deleted_at IS NULL',
      [citizenId, reportType]
    );
    if (rows.length > 0) return rows[0];
  }

  // 2. Fallback check by firstName and lastName
  if (data.firstName && data.lastName) {
    const { rows } = await db.query(
      'SELECT * FROM missing_reports WHERE first_name ILIKE $1 AND last_name ILIKE $2 AND report_type = $3 AND deleted_at IS NULL',
      [data.firstName, data.lastName, reportType]
    );
    if (rows.length > 0) return rows[0];
  }

  return null;
};

export const findAllMatchingReports = async (data) => {
...
  const citizenId = data.citizenId || data.citizen_id;
  const firstName = data.firstName || data.first_name;
  const lastName = data.lastName || data.last_name;

  const conditions = [];
...
    values.push(citizenId);
    conditions.push(`citizen_id = $${values.length}`);
  }

  if (firstName && lastName) {
    values.push(firstName, lastName);
    conditions.push(`(first_name ILIKE $${values.length - 1} AND last_name ILIKE $${values.length})`);
  }

  if (conditions.length === 0) return [];
...
};

export const updateReportLocation = async (id, locationData) => {
  const db = getDbConnection();
  const query = `
    UPDATE missing_reports 
    SET location = $1, last_updated_by = $2, 
        life_status = COALESCE($3, life_status),
        latitude = COALESCE($4, latitude), 
        longitude = COALESCE($5, longitude),
        photo_url = COALESCE($6, photo_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *
  `;
  const { rows } = await db.query(query, [
    locationData.location, 
    locationData.source, 
    locationData.lifeStatus, 
    locationData.lat || locationData.latitude || null,
    locationData.long || locationData.longitude || null,
    locationData.photoUrl || locationData.photo_url || null,
    id
  ]);
  return rows[0];
};

export const findReunificationByReportId = async (reportId) => {
  const db = getDbConnection();
  const { rows } = await db.query(
    'SELECT * FROM reunifications WHERE report_id = $1',
    [reportId]
  );
  return rows[0];
};

export const createReunification = async (reunificationData) => {
  const db = getDbConnection();
  const query = `
    INSERT INTO reunifications (report_id, matched_report_id, status, details)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (report_id) DO UPDATE SET 
      matched_report_id = COALESCE(EXCLUDED.matched_report_id, reunifications.matched_report_id),
      status = EXCLUDED.status, 
      details = reunifications.details || EXCLUDED.details, 
      matched_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const { rows } = await db.query(query, [
    reunificationData.reportId, 
    reunificationData.matchedReportId || null,
    reunificationData.status, 
    reunificationData.details
  ]);
  return rows[0];
};

export const getReportById = async (id) => {
  const db = getDbConnection();
  const { rows } = await db.query('SELECT * FROM missing_reports WHERE id = $1', [id]);
  return rows[0];
};

export const getReunifications = async () => {
  const db = getDbConnection();
  const query = `
    SELECT 
      r.id, r.report_id, r.matched_report_id, r.status, r.matched_at, r.details,
      m.first_name, m.last_name, m.details as report_details, m.location as current_location,
      m.photo_url, m.incident_id, m.status as person_status, m.report_type,
      m2.first_name as matched_first_name, m2.last_name as matched_last_name, 
      m2.details as matched_details, m2.location as matched_location,
      m2.photo_url as matched_photo_url, m2.incident_id as matched_incident_id,
      m2.status as matched_person_status, m2.report_type as matched_report_type
    FROM reunifications r
    JOIN missing_reports m ON r.report_id = m.id
    LEFT JOIN missing_reports m2 ON r.matched_report_id = m2.id
    ORDER BY r.matched_at DESC
  `;
  const { rows } = await db.query(query);
  return rows;
};

export const findPotentialUnidentifiedMatches = async (missingReport) => {
  const db = getDbConnection();
  // Simple matching logic: gender match and similar location or incident
  const query = `
    SELECT * FROM missing_reports 
    WHERE is_unidentified = true 
    AND (gender = $1 OR gender = 'unknown')
    AND incident_id = $2
    AND deleted_at IS NULL
    LIMIT 5
  `;
  const { rows } = await db.query(query, [missingReport.gender, missingReport.incident_id]);
  return rows;
};

export const updateReportStatus = async (id, status) => {
  const db = getDbConnection();
  const query = 'UPDATE missing_reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
  const { rows } = await db.query(query, [status, id]);
  return rows[0];
};

export const getFullCaseDetail = async (id) => {
  const db = getDbConnection();
  
  // 1. Get main report
  const personRes = await db.query('SELECT * FROM missing_reports WHERE id = $1', [id]);
  const person = personRes.rows[0];
  if (!person) return null;

  // 2. Get matches (Reunifications)
  const matchRes = await db.query(`
    SELECT r.*, m.first_name, m.last_name, m.photo_url, m.details as match_details, m.location as match_location
    FROM reunifications r
    LEFT JOIN missing_reports m ON r.matched_report_id = m.id
    WHERE r.report_id = $1 OR r.matched_report_id = $1
  `, [id]);

  // 3. Get timeline events
  const eventsRes = await db.query('SELECT * FROM case_events WHERE report_id = $1 ORDER BY created_at DESC', [id]);

  // 4. Get verification info
  const verifyRes = await db.query('SELECT * FROM verification_records WHERE report_id = $1 ORDER BY created_at DESC LIMIT 1', [id]);

  return {
    person,
    matches: matchRes.rows,
    timeline: eventsRes.rows,
    verification: verifyRes.rows[0]
  };
};

export const addCaseEvent = async (reportId, type, message, details = {}) => {
  const db = getDbConnection();
  const query = 'INSERT INTO case_events (report_id, event_type, message, details) VALUES ($1, $2, $3, $4) RETURNING *';
  const { rows } = await db.query(query, [reportId, type, message, JSON.stringify(details)]);
  return rows[0];
};

export const getSystemStats = async (incidentId = null) => {
  const db = getDbConnection();
  let whereClause = 'WHERE deleted_at IS NULL';
  const values = [];

  if (incidentId && incidentId !== 'all') {
    values.push(incidentId);
    whereClause += ' AND incident_id = $1';
  }

  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('REPORTED', 'VERIFYING', 'ACTIVE', 'MATCHING')) as total_missing,
      COUNT(*) FILTER (WHERE status IN ('VERIFIED', 'REUNITED', 'CLOSED')) as total_found,
      COUNT(*) FILTER (WHERE status IN ('REPORTED', 'VERIFYING', 'ACTIVE', 'MATCHING') AND report_type = 'unidentified-victim') as total_safe,
      COUNT(*) FILTER (WHERE status IN ('REPORTED', 'VERIFYING', 'ACTIVE', 'MATCHING') AND report_type = 'unidentified-deceased') as total_unidentified,
      COUNT(*) FILTER (WHERE status NOT IN ('REUNITED', 'CLOSED')) as open_cases
    FROM missing_reports
    ${whereClause}
  `;

  const { rows } = await db.query(query, values);
  return rows[0];
};
