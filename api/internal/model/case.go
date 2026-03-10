package model
import "time"

// reporter represent data about who report this case to the system
type Reporter struct {
    Fullname string `json:"fullname" binding:"required"`
    Contact  string `json:"contact_number" binding:"required"`
    Relation string `json:"relation" binding:"required,oneof=FATHER MOTHER SIBLING FRIEND GUARDIAN OTHER"`
}


// PersonDetail represent data about the person who is missing
type PersonDetail struct {
	Firstname string `json:"first_name" binding:"required"`
	Lastname string `json:"last_name" binding:"required"`
	Age int `json:"age" binding:"required,gte=0,lte=120"`
	Gender string `json:"gender" binding:"required,oneof=MALE FEMALE OTHER"`
	HeightCm string `json:"height_cm"`
	WeightKg string `json:"weight_kg"`
	HairColor string `json:"hair_color"`
	HairType string `json:"hair_type"`
	PhysicalMarks string `json:"physical_marks"`
}

// Location represent data about Last seen Location of missing people
type Location struct {
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
	Description string  `json:"description"`
}

// Lastseen represent data about Last seen Detail of missing people
type LastSeen struct {
	DateTime           time.Time `json:"datetime" binding:"required"`
	Location           Location  `json:"location"`
	ClothesDescription string    `json:"clothes_description"`
}

type CreateCaseRequest struct {
	IncidentID       string       `json:"incident_id" binding:"required"`
	ReportedBy       Reporter     `json:"reported_by" binding:"required"`
	PersonDetail     PersonDetail `json:"person_detail" binding:"required"`
	LastSeen         LastSeen     `json:"last_seen" binding:"required"`
	SpecialCondition string       `json:"special_condition"`
	PriorityLevel    string       `json:"priority_level" binding:"required"`
}

type CreateCaseResponse struct {
    MissingID     string `json:"missing_id"`
    IncidentID    string `json:"incident_id"`
    Status        string `json:"status"`
    PriorityLevel string `json:"priority_level"`
    CreatedAt     string `json:"created_at"`
}



type MissingPersonDetail struct {
	MissingPersonID string `json:"missing_person_id"`
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name"`
	Gender          string `json:"gender"`
	Age             int    `json:"age"`
	HeightCm        int    `json:"height_cm"` 
	WeightKg        int    `json:"weight_kg"`
}