CREATE TABLE IF NOT EXISTS missing_reports (
  id SERIAL PRIMARY KEY,
  reporter_id VARCHAR(255),
  incident_id VARCHAR(255),
  details TEXT,
  status VARCHAR(50) DEFAULT 'REPORTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  photo_url TEXT,
  location TEXT,
  is_unidentified BOOLEAN DEFAULT FALSE,
  source VARCHAR(255),
  hospital_id VARCHAR(50),
  age_category VARCHAR(50),
  gender VARCHAR(10),
  life_status VARCHAR(50),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  age INTEGER,
  report_type VARCHAR(50) DEFAULT 'missing-person',
  citizen_id VARCHAR(20),
  external_id VARCHAR(255),
  last_updated_by VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- 1. ป้องกันสร้างคนเดิมซ้ำในสถานะเดียวกัน (ถ้ามี Citizen ID)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_citizen_report_type 
ON missing_reports (citizen_id, report_type) 
WHERE deleted_at IS NULL AND citizen_id IS NOT NULL;

-- 2. ป้องกันยิง Request/Message ชุดเดิมซ้ำ
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_external_id_source 
ON missing_reports (external_id, source) 
WHERE deleted_at IS NULL AND external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS matching_results (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES missing_reports(id),
  score DECIMAL(4, 3),
  status VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reunifications (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES missing_reports(id),
    matched_report_id INTEGER REFERENCES missing_reports(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_report_id UNIQUE (report_id)
);

-- Seed some incidents for demo
INSERT INTO incidents (name, location, status) VALUES 
('Flood 2024', 'Bangkok', 'active'),
('Earthquake', 'Chiang Mai', 'active')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS case_events (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES missing_reports(id),
  event_type VARCHAR(100),
  message TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
