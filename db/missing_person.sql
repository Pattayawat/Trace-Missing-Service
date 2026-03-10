CREATE TABLE missing_person (
    missing_person_id UUID PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    age INT,
    height_cm TEXT,
    weight_kg INT,
    hair_color TEXT,
    hair_type TEXT,
    physical_mark TEXT,
    special_condition TEXT
)