export type PersonStatus = "missing" | "found" | "unidentified" | "safe"
export type PersonType = "missing-person" | "unidentified-body" | "survivor"

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  description: string
  available: string
  priority: "critical" | "high" | "normal"
}

export const emergencyContacts: EmergencyContact[] = [
  {
    id: "ec-1",
    name: "National Emergency Hotline",
    phone: "911",
    description: "For life-threatening emergencies and immediate assistance",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "ec-2",
    name: "Disaster Relief Command Center",
    phone: "1-800-555-0199",
    description: "Central coordination for all relief operations",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "ec-3",
    name: "Family Reunification Hotline",
    phone: "1-800-555-0188",
    description: "Report or inquire about missing family members",
    available: "6 AM - 11 PM",
    priority: "high",
  },
  {
    id: "ec-4",
    name: "Medical Assistance Line",
    phone: "1-800-555-0177",
    description: "Non-emergency medical inquiries and hospital info",
    available: "24/7",
    priority: "high",
  },
  {
    id: "ec-5",
    name: "Shelter Information",
    phone: "1-800-555-0166",
    description: "Find available shelters and capacity updates",
    available: "8 AM - 10 PM",
    priority: "normal",
  },
  {
    id: "ec-6",
    name: "Mental Health Support",
    phone: "1-800-555-0155",
    description: "Crisis counseling and emotional support services",
    available: "24/7",
    priority: "normal",
  },
]

export interface PotentialMatch {
  id: string
  confidence: number
  missingPerson: Person
  foundPerson: Person
  matchingFeatures: string[]
  createdAt: Date
}

export const mockPotentialMatches: PotentialMatch[] = [
  {
    id: "match-1",
    confidence: 87,
    missingPerson: {
      id: "mp-match-1",
      type: "missing-person",
      status: "missing",
      name: "Maria Santos",
      caseId: "MP-2024-0891",
      age: 34,
      ageGroup: "adult",
      gender: "female",
      location: "Downtown Shelter Area, Block 5",
      lastSeenDate: "2024-01-15",
      photoUrl: null,
      description: "Last seen wearing blue jacket, dark hair, 5'4\"",
      contactPhone: "+1 555-0123",
    },
    foundPerson: {
      id: "sv-match-1",
      type: "survivor",
      status: "safe",
      name: "Unknown Female",
      caseId: "SV-2024-0161",
      age: 35,
      ageGroup: "adult",
      gender: "female",
      location: "Central Hospital, Ward 2A",
      lastSeenDate: "2024-01-16",
      photoUrl: null,
      description: "Dark hair, approximately 5'4\", blue clothing found nearby",
    },
    matchingFeatures: ["Age range", "Gender", "Hair color", "Height", "Clothing description"],
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "match-2",
    confidence: 72,
    missingPerson: {
      id: "mp-match-2",
      type: "missing-person",
      status: "missing",
      name: "Thomas Williams",
      caseId: "MP-2024-0893",
      age: 78,
      ageGroup: "elderly",
      gender: "male",
      location: "Sunset Heights Neighborhood",
      lastSeenDate: "2024-01-15",
      photoUrl: null,
      description: "Uses walker, wears glasses, hearing impaired",
      contactPhone: "+1 555-0127",
    },
    foundPerson: {
      id: "sv-match-2",
      type: "survivor",
      status: "safe",
      name: "Unknown Elderly Male",
      caseId: "SV-2024-0162",
      age: 75,
      ageGroup: "elderly",
      gender: "male",
      location: "Memorial Hospital, Room 315",
      lastSeenDate: "2024-01-16",
      photoUrl: null,
      description: "Elderly male with glasses, mobility aid user, hearing difficulties",
    },
    matchingFeatures: ["Age range", "Gender", "Glasses", "Mobility aid", "Hearing impairment"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "match-3",
    confidence: 65,
    missingPerson: {
      id: "mp-match-3",
      type: "missing-person",
      status: "missing",
      name: "Sophie Anderson",
      caseId: "MP-2024-0894",
      age: 16,
      ageGroup: "teen",
      gender: "female",
      location: "Central High School Area",
      lastSeenDate: "2024-01-15",
      photoUrl: null,
      description: "School uniform, pink phone case, blonde hair",
      contactPhone: "+1 555-0129",
    },
    foundPerson: {
      id: "sv-match-3",
      type: "survivor",
      status: "safe",
      name: "Teen Female",
      caseId: "SV-2024-0163",
      age: 17,
      ageGroup: "teen",
      gender: "female",
      location: "Community Center Shelter",
      lastSeenDate: "2024-01-16",
      photoUrl: null,
      description: "Teen female, light hair, wearing what appears to be school attire",
    },
    matchingFeatures: ["Age range", "Gender", "Hair color", "School attire"],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
]

export interface ActivityItem {
  id: string
  type: "new_report" | "status_update" | "match_found" | "shelter_update"
  message: string
  location: string
  timestamp: Date
  caseId?: string
}

export const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "new_report",
    message: "New survivor reported at Central Hospital",
    location: "Central Hospital, Ward 3B",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    caseId: "SV-2024-0160",
  },
  {
    id: "act-2",
    type: "status_update",
    message: "Missing person Maria Santos status updated",
    location: "Downtown Shelter Area",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    caseId: "MP-2024-0891",
  },
  {
    id: "act-3",
    type: "match_found",
    message: "Potential match found for unidentified case",
    location: "West Riverside",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    caseId: "UB-2024-0034",
  },
  {
    id: "act-4",
    type: "shelter_update",
    message: "Shelter A capacity reached 85%",
    location: "Community Center Shelter",
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: "act-5",
    type: "new_report",
    message: "New missing person report filed",
    location: "North District",
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    caseId: "MP-2024-0896",
  },
  {
    id: "act-6",
    type: "status_update",
    message: "Robert Chen reunited with family",
    location: "Eastern Relief Camp",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    caseId: "MP-2024-0889",
  },
  {
    id: "act-7",
    type: "shelter_update",
    message: "New supplies arrived at Memorial Hospital",
    location: "Memorial Hospital",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "act-8",
    type: "new_report",
    message: "Unidentified individual found near bridge",
    location: "South Bridge Area",
    timestamp: new Date(Date.now() - 75 * 60 * 1000),
    caseId: "UB-2024-0036",
  },
]

export interface LocationData {
  name: string
  missing: number
  found: number
  unidentified: number
  lat: number
  lng: number
}

export const mockLocationData: LocationData[] = [
  { name: "Downtown", missing: 12, found: 8, unidentified: 2, lat: 40.7128, lng: -74.006 },
  { name: "North District", missing: 8, found: 5, unidentified: 1, lat: 40.7580, lng: -73.9855 },
  { name: "West Riverside", missing: 15, found: 3, unidentified: 4, lat: 40.7282, lng: -74.0776 },
  { name: "East Side", missing: 6, found: 9, unidentified: 0, lat: 40.7614, lng: -73.9776 },
  { name: "South Bridge", missing: 10, found: 4, unidentified: 3, lat: 40.6892, lng: -74.0445 },
]

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
}

export const mockPersons: Person[] = [
  {
    id: "1",
    type: "missing-person",
    status: "missing",
    name: "Maria Santos",
    caseId: "MP-2024-0891",
    age: 34,
    ageGroup: "adult",
    gender: "female",
    location: "Downtown Shelter Area, Block 5",
    lastSeenDate: "2024-01-15",
    photoUrl: null,
    description: "Last seen wearing blue jacket and jeans",
    contactPhone: "+1 555-0123",
  },
  {
    id: "2",
    type: "missing-person",
    status: "missing",
    name: "James Rodriguez",
    caseId: "MP-2024-0892",
    age: 8,
    ageGroup: "child",
    gender: "male",
    location: "North District, near School #12",
    lastSeenDate: "2024-01-14",
    photoUrl: null,
    description: "Wearing red backpack and green shirt",
    contactPhone: "+1 555-0124",
  },
  {
    id: "3",
    type: "survivor",
    status: "safe",
    name: "Elena Kim",
    caseId: "SV-2024-0156",
    age: 67,
    ageGroup: "elderly",
    gender: "female",
    location: "Central Hospital, Ward 3B",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "Stable condition, minor injuries",
    contactPhone: "+1 555-0125",
  },
  {
    id: "4",
    type: "unidentified-body",
    status: "unidentified",
    name: null,
    caseId: "UB-2024-0034",
    age: 45,
    ageGroup: "adult",
    gender: "male",
    location: "West Riverside, Grid C-7",
    lastSeenDate: "2024-01-13",
    photoUrl: null,
    description: "Approx 5'10, dark hair, tattoo on left arm",
  },
  {
    id: "5",
    type: "missing-person",
    status: "found",
    name: "Robert Chen",
    caseId: "MP-2024-0889",
    age: 52,
    ageGroup: "adult",
    gender: "male",
    location: "Eastern Relief Camp",
    lastSeenDate: "2024-01-12",
    photoUrl: null,
    description: "Found safe at shelter on Jan 16",
    contactPhone: "+1 555-0126",
  },
  {
    id: "6",
    type: "survivor",
    status: "safe",
    name: "Unknown Female",
    caseId: "SV-2024-0157",
    age: 25,
    ageGroup: "adult",
    gender: "female",
    location: "Memorial Hospital ICU",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "Unable to communicate, seeking identification",
  },
  {
    id: "7",
    type: "missing-person",
    status: "missing",
    name: "Thomas Williams",
    caseId: "MP-2024-0893",
    age: 78,
    ageGroup: "elderly",
    gender: "male",
    location: "Sunset Heights Neighborhood",
    lastSeenDate: "2024-01-15",
    photoUrl: null,
    description: "Uses walker, wears glasses, hearing impaired",
    contactPhone: "+1 555-0127",
  },
  {
    id: "8",
    type: "unidentified-body",
    status: "unidentified",
    name: null,
    caseId: "UB-2024-0035",
    age: 30,
    ageGroup: "adult",
    gender: "female",
    location: "South Bridge Area",
    lastSeenDate: "2024-01-14",
    photoUrl: null,
    description: "Approx 5'5, blonde hair, floral dress",
  },
  {
    id: "9",
    type: "survivor",
    status: "safe",
    name: "David Park",
    caseId: "SV-2024-0158",
    age: 42,
    ageGroup: "adult",
    gender: "male",
    location: "Community Center Shelter",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "Good condition, looking for family",
    contactPhone: "+1 555-0128",
  },
  {
    id: "10",
    type: "missing-person",
    status: "missing",
    name: "Sophie Anderson",
    caseId: "MP-2024-0894",
    age: 16,
    ageGroup: "teen",
    gender: "female",
    location: "Central High School Area",
    lastSeenDate: "2024-01-15",
    photoUrl: null,
    description: "School uniform, pink phone case",
    contactPhone: "+1 555-0129",
  },
  {
    id: "11",
    type: "survivor",
    status: "safe",
    name: "Michael Brown",
    caseId: "SV-2024-0159",
    age: 55,
    ageGroup: "adult",
    gender: "male",
    location: "St. Mary's Hospital, Room 412",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "Recovering from leg injury",
    contactPhone: "+1 555-0130",
  },
  {
    id: "12",
    type: "missing-person",
    status: "missing",
    name: "Lisa Martinez",
    caseId: "MP-2024-0895",
    age: 29,
    ageGroup: "adult",
    gender: "female",
    location: "Greenwood Apartments",
    lastSeenDate: "2024-01-14",
    photoUrl: null,
    description: "Pregnant, 7 months, wearing maternity dress",
    contactPhone: "+1 555-0131",
  },
]
