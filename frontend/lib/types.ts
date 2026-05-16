// Incident types - fetched from external Incident Service API
export type IncidentStatus = "active" | "monitoring" | "resolved"
export type IncidentType = "flood" | "fire" | "earthquake" | "storm" | "landslide" | "other"

export interface Incident {
  incidentId: string
  incidentName: string
  incidentType: IncidentType
  province: string
  location: string
  incidentStatus: IncidentStatus
  startDate: string
  description?: string
}

// Person types - managed by this service
export type PersonStatus = "missing" | "found" | "unidentified" | "safe"
export type PersonType = "missing-person" | "unidentified-body" | "survivor"

export interface Person {
  id: string
  type: PersonType
  status: PersonStatus
  name: string | null
  caseId: string
  age: number | null
  ageGroup: "child" | "teen" | "adult" | "elderly" | null
  gender: "male" | "female" | "unknown"
  location: string
  lastSeenDate: string
  photoUrl: string | null
  description: string
  contactPhone?: string
  incidentId: string // Link to incident
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  description: string
  available: string
  priority: "critical" | "high" | "normal"
}

export interface PotentialMatch {
  id: string
  confidence: number
  missingPerson: Person
  foundPerson: Person
  matchingFeatures: string[]
  createdAt: Date
}

export interface ActivityItem {
  id: string
  type: "new_report" | "status_update" | "match_found" | "shelter_update"
  message: string
  location: string
  timestamp: Date
  caseId?: string
  incidentId?: string
}

export interface LocationData {
  name: string
  missing: number
  found: number
  unidentified: number
  lat: number
  lng: number
}

// Dashboard metrics type
export interface DashboardMetrics {
  totalMissing: number
  totalFound: number
  totalSafe: number
  totalUnidentified: number
  openCases: number
}

// Filter state with incident support
export interface FilterState {
  search: string
  status: string
  location: string
  ageGroup: string
  dateRange: string
  incidentId: string
  incidentType: string
  province: string
}
