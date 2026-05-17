CREATE TABLE IF NOT EXISTS missing_reports (
  id SERIAL PRIMARY KEY,
  reporter_id VARCHAR(255),
  incident_id INT,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

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

-- Seed some incidents for demo
INSERT INTO incidents (name, location, status) VALUES 
('Flood 2024', 'Bangkok', 'active'),
('Earthquake', 'Chiang Mai', 'active')
ON CONFLICT DO NOTHING;
