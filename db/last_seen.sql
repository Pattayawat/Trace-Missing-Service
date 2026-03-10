CREATE TABLE last_seen (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    datetime TIMESTAMP,
    clothes_description TEXT,
    location_id UUID
);