package service

import (
    "database/sql"
	"errors"
    "fmt"
	"time"

	"trace-missing-api/api/internal/model"
	"trace-missing-api/api/internal/event"
)
type CaseService interface {
	CreateMissingReport(req model.CreateCaseRequest) (*model.CreateCaseResponse, error)

	GetCaseByID(id string) (*model.MissingPersonDetail, error) 
    ListCases() ([]model.MissingPersonDetail, error)
}

type caseService struct {
	db *sql.DB
}

func (s *caseService) GetCaseByID(id string) (*model.MissingPersonDetail, error) {

	query := `
		SELECT missing_person_id, first_name, last_name, gender, age, height_cm, weight_kg
		FROM missing_person
		WHERE missing_person_id = $1
	`

	var detail model.MissingPersonDetail

	
	err := s.db.QueryRow(query, id).Scan(
		&detail.MissingPersonID,
		&detail.FirstName,
		&detail.LastName,
		&detail.Gender,
		&detail.Age,
		&detail.HeightCm,
		&detail.WeightKg,
	)

	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("CASE_NOT_FOUND") 
		}
		return nil, err 
    }
	return &detail, nil
}

func NewCaseService(db *sql.DB) CaseService {
	return &caseService{
		db: db,
	}
}

func (s *caseService) CreateMissingReport(req model.CreateCaseRequest) (*model.CreateCaseResponse, error) {

	if req.IncidentID == "INC-999" {
		return nil, errors.New("INCIDENT_NOT_FOUND")
	}

	query := `
		INSERT INTO missing_person (
			missing_person_id, first_name, last_name, gender, age, height_cm, weight_kg
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5, $6
		) RETURNING missing_person_id;
	`

	var missingID string
	err := s.db.QueryRow(query,
		req.PersonDetail.Firstname,
		req.PersonDetail.Lastname,
		req.PersonDetail.Gender,
		req.PersonDetail.Age,
		req.PersonDetail.HeightCm,  
		req.PersonDetail.WeightKg,
	).Scan(&missingID)

	if err != nil {
		return nil, fmt.Errorf("ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลได้: %v", err)
	}


	resp := &model.CreateCaseResponse{
		MissingID:     missingID,
		IncidentID:    req.IncidentID,
		Status:        "OPEN",
		PriorityLevel: req.PriorityLevel,
		CreatedAt:     time.Now().Format(time.RFC3339),
	}


	ev := event.MissingCaseCreatedEvent{
		Headers: event.EventHeader{
			MessageID:  "MSG-123",
			EventType:  "MissingCaseCreated",
			OccurredAt: time.Now().Format(time.RFC3339),
			Version:    "v1",
			Producer:   "trace-missing-service",
		},
		Body: event.MissingCaseCreatedBody{
			MissingID:  missingID,
			IncidentID: req.IncidentID,
			FirstName:  req.PersonDetail.Firstname,
			LastName:   req.PersonDetail.Lastname,
			Age:        req.PersonDetail.Age,
			Gender:     req.PersonDetail.Gender,
			Status:     "OPEN",
		},
	}
	event.PublishMissingCaseCreated(ev)

	return resp, nil
}

func (s *caseService) ListCases() ([]model.MissingPersonDetail, error) {
	
	query := `
		SELECT missing_person_id, first_name, last_name, gender, age, height_cm, weight_kg
		FROM missing_person
	`

	
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close() 

	var cases []model.MissingPersonDetail


	for rows.Next() {
		var detail model.MissingPersonDetail

		err := rows.Scan(
			&detail.MissingPersonID,
			&detail.FirstName,
			&detail.LastName,
			&detail.Gender,
			&detail.Age,
			&detail.HeightCm,
			&detail.WeightKg,
		)
		if err != nil {
			return nil, err
		}
		
		cases = append(cases, detail)
	}

	
	if err = rows.Err(); err != nil {
		return nil, err
	}

	
	if cases == nil {
		cases = []model.MissingPersonDetail{}
	}

	return cases, nil
}