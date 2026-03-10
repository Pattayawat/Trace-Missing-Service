CREATE TABLE unidentified_person (
    id UUID PRIMARY KEY,
    hospital_id UUID REFERENCES hospitals(id),
    gender TEXT,
    estimated_age INT,
    height_cm INT,
    weight_kg INT,
    skin_color TEXT,
    hair_color TEXT,
    hair_type TEXT,
    physical_marks TEXT,
    found_location_id UUID,
    found_at TIMESTAMP,
    status TEXT DEFAULT 'UNMATCHED'
)