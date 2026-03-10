package event

type EventHeader struct {
	MessageID  string `json:"messageId"`
	EventType  string `json:"eventType"`
	OccurredAt string `json:"occurredAt"`
	Version    string `json:"version"`
	Producer   string `json:"producer"`
}

type LastSeenLocation struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type MissingCaseCreatedBody struct {
	MissingID        string           `json:"missing_id"`
	IncidentID       string           `json:"incident_id"`
	FirstName        string           `json:"firstName"`
	LastName         string           `json:"lastName"`
	Age              int              `json:"age"`
	Gender           string           `json:"gender"`
	LastSeenLocation LastSeenLocation `json:"lastSeenLocation"`
	Status           string           `json:"status"`
	ReportedAt       string           `json:"reportedAt"`
}

type MissingCaseCreatedEvent struct {
	Headers EventHeader            `json:"headers"`
	Body    MissingCaseCreatedBody `json:"body"`
}