package service

import (
	"errors"
	"time"

	"example/trace-missing-api/internal/model"
	"example/trace-missing-api/internal/event"
)

type CaseService interface {
	CreateMissingReport(req model.CreateCaseRequest) (*model.CreateCaseResponse, error)
}

type caseService struct{}

func NewCaseService() CaseService {
	return &caseService{}
}

func (s *caseService) CreateMissingReport(req model.CreateCaseRequest) (*model.CreateCaseResponse, error) {

    if req.IncidentID == "INC-999" {
        return nil, errors.New("INCIDENT_NOT_FOUND")
    }

    missingID := "MID-2026-002"

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