CREATE TABLE cases (
    id UUID PRIMARY KEY,
    incident_id TEXT,
    priority_level TEXT,
    special_condition TEXT,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMP
);