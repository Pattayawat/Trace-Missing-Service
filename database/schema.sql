-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- missing_reports table
CREATE TABLE IF NOT EXISTS missing_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id VARCHAR(255) NOT NULL,
    incident_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- cases table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES missing_reports(id),
    status VARCHAR(50) NOT NULL DEFAULT 'investigating',
    priority VARCHAR(50) DEFAULT 'normal',
    assigned_officer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- persons table
CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    date_of_birth DATE,
    physical_description TEXT,
    last_seen_location TEXT,
    last_seen_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- person_photos table
CREATE TABLE IF NOT EXISTS person_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id),
    file_path VARCHAR(512) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    is_primary BOOLEAN DEFAULT false,
    face_embedding vector(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- matching_jobs table
CREATE TABLE IF NOT EXISTS matching_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    person_id UUID REFERENCES persons(id),
    status VARCHAR(50) DEFAULT 'queued',
    methods JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- shelter_person_cache table
CREATE TABLE IF NOT EXISTS shelter_person_cache (
    resident_id VARCHAR(255) PRIMARY KEY,
    shelter_id VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    gender VARCHAR(50),
    date_of_birth DATE,
    face_embedding vector(512),
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- matching_results table
CREATE TABLE IF NOT EXISTS matching_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id),
    case_id UUID REFERENCES cases(id),
    shelter_id VARCHAR(255),
    shelter_resident_id VARCHAR(255),
    match_score FLOAT,
    match_method VARCHAR(50),
    matched_fields JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- outbox_events table
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(255) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    correlation_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- inbox_events table
CREATE TABLE IF NOT EXISTS inbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_service VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_result_id UUID REFERENCES matching_results(id),
    status VARCHAR(50) DEFAULT 'pending',
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_outbox_events_status ON outbox_events(status, next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_shelter_person_cache_embedding ON shelter_person_cache USING ivfflat (face_embedding vector_cosine_ops);
CREATE INDEX idx_person_photos_embedding ON person_photos USING ivfflat (face_embedding vector_cosine_ops);
