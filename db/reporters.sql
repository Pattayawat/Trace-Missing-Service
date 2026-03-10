CREATE TABLE reporters (
    id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    fullname TEXT,
    contact_number TEXT,
    relation TEXT
);