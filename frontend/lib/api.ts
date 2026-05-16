import type {
  Incident,
  Person,
  ActivityItem,
  LocationData,
  EmergencyContact,
  PotentialMatch,
  DashboardMetrics,
} from "./types"

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================
// MOCK INCIDENTS (from external service)
// ============================================
export const mockIncidents: Incident[] = [
  {
    incidentId: "INC-2026-001",
    incidentName: "ไฟป่าเชียงใหม่ 2026",
    incidentType: "fire",
    province: "เชียงใหม่",
    location: "อ.แม่แตง, อ.เชียงดาว",
    incidentStatus: "active",
    startDate: "2026-01-10",
    description: "เหตุไฟป่าลุกลามในพื้นที่ป่าสงวนแห่งชาติ",
  },
  {
    incidentId: "INC-2026-002",
    incidentName: "น้ำท่วมหาดใหญ่ 2026",
    incidentType: "flood",
    province: "สงขลา",
    location: "อ.หาดใหญ่, อ.เมือง",
    incidentStatus: "active",
    startDate: "2026-01-12",
    description: "น้ำท่วมฉับพลันจากฝนตกหนัก",
  },
  {
    incidentId: "INC-2026-003",
    incidentName: "ดินถล่มนครศรีธรรมราช",
    incidentType: "landslide",
    province: "นครศรีธรรมราช",
    location: "อ.นบพิตำ",
    incidentStatus: "monitoring",
    startDate: "2026-01-08",
    description: "ดินถล่มบริเวณเชิงเขา",
  },
  {
    incidentId: "INC-2025-089",
    incidentName: "พายุโซนร้อนเพชรบุรี",
    incidentType: "storm",
    province: "เพชรบุรี",
    location: "อ.เมือง, อ.ชะอำ",
    incidentStatus: "resolved",
    startDate: "2025-12-20",
    description: "พายุโซนร้อนพัดเข้าชายฝั่ง",
  },
  {
    incidentId: "INC-2025-088",
    incidentName: "แผ่นดินไหวเชียงราย",
    incidentType: "earthquake",
    province: "เชียงราย",
    location: "อ.แม่ลาว",
    incidentStatus: "resolved",
    startDate: "2025-12-15",
    description: "แผ่นดินไหวขนาด 5.2",
  },
]

// ============================================
// IN-MEMORY STORE (for session persistence)
// ============================================
let personsStore: Person[] = [
  // ไฟป่าเชียงใหม่
  {
    id: "1",
    type: "missing-person",
    status: "missing",
    name: "สมชาย วงศ์ใหญ่",
    citizenId: "1-1001-01234-56-1",
    caseId: "MP-2026-0001",
    age: 45,
    ageGroup: "adult",
    gender: "male",
    location: "บ้านแม่แตง, อ.แม่แตง",
    lastSeenDate: "2026-01-11",
    photoUrl: null,
    description: "พบครั้งสุดท้ายขณะเดินป่าบริเวณเชิงดอย",
    contactPhone: "081-555-0001",
    incidentId: "INC-2026-001",
  },
  {
    id: "2",
    type: "missing-person",
    status: "missing",
    name: "สุดา แก้วมณี",
    citizenId: "3-5002-99887-77-2",
    caseId: "MP-2026-0002",
    age: 32,
    ageGroup: "adult",
    gender: "female",
    location: "บ้านเชียงดาว, อ.เชียงดาว",
    lastSeenDate: "2026-01-12",
    photoUrl: null,
    description: "หายไปขณะอพยพจากพื้นที่ไฟป่า",
    contactPhone: "081-555-0002",
    incidentId: "INC-2026-001",
  },
  {
    id: "3",
    type: "survivor",
    status: "safe",
    name: "หญิงไม่ทราบชื่อ",
    citizenId: null,
    caseId: "SV-2026-0001",
    age: 25,
    ageGroup: "adult",
    gender: "female",
    location: "โรงพยาบาลนครพิงค์",
    lastSeenDate: "2026-01-13",
    photoUrl: null,
    description: "พบตัวในสภาพหมดสติ กำลังระบุตัวตน",
    incidentId: "INC-2026-001",
  },
  {
    id: "4",
    type: "unidentified-body",
    status: "unidentified",
    name: null,
    citizenId: null,
    caseId: "UB-2026-0001",
    age: 50,
    ageGroup: "adult",
    gender: "male",
    location: "ป่าสงวนแห่งชาติ แม่แตง",
    lastSeenDate: "2026-01-14",
    photoUrl: null,
    description: "พบร่างในพื้นที่เผาไหม้ สูงประมาณ 170 ซม.",
    incidentId: "INC-2026-001",
  },
  // น้ำท่วมหาดใหญ่
  {
    id: "5",
    type: "missing-person",
    status: "missing",
    name: "อาหมัด มะหะหมัด",
    citizenId: "1-9003-55667-88-9",
    caseId: "MP-2026-0003",
    age: 8,
    ageGroup: "child",
    gender: "male",
    location: "ตลาดกิมหยง, อ.หาดใหญ่",
    lastSeenDate: "2026-01-13",
    photoUrl: null,
    description: "สูญหายระหว่างน้ำท่วมฉับพลัน สวมเสื้อสีแดง",
    contactPhone: "081-555-0003",
    incidentId: "INC-2026-002",
  },
  {
    id: "6",
    type: "missing-person",
    status: "found",
    name: "สุนีย์ หมัดหมาน",
    citizenId: "3-9001-22334-44-5",
    caseId: "MP-2026-0004",
    age: 67,
    ageGroup: "elderly",
    gender: "female",
    location: "บ้านคลองแห, อ.หาดใหญ่",
    lastSeenDate: "2026-01-12",
    photoUrl: null,
    description: "พบตัวปลอดภัยที่ศูนย์พักพิง",
    contactPhone: "081-555-0004",
    incidentId: "INC-2026-002",
  },
  {
    id: "7",
    type: "survivor",
    status: "safe",
    name: "วิชัย แซ่ลิ้ม",
    citizenId: "3-1004-88776-55-4",
    caseId: "SV-2026-0002",
    age: 42,
    ageGroup: "adult",
    gender: "male",
    location: "โรงพยาบาลหาดใหญ่",
    lastSeenDate: "2026-01-14",
    photoUrl: null,
    description: "อาการคงที่ กำลังพักฟื้น",
    contactPhone: "081-555-0005",
    incidentId: "INC-2026-002",
  },
  {
    id: "8",
    type: "unidentified-body",
    status: "unidentified",
    name: null,
    citizenId: null,
    caseId: "UB-2026-0002",
    age: 35,
    ageGroup: "adult",
    gender: "female",
    location: "คลองอู่ตะเภา",
    lastSeenDate: "2026-01-14",
    photoUrl: null,
    description: "พบร่างในคลอง สูงประมาณ 160 ซม. ผมยาว",
    incidentId: "INC-2026-002",
  },
  // ดินถล่ม
  {
    id: "9",
    type: "missing-person",
    status: "missing",
    name: "ประยุทธ์ ทองดี",
    citizenId: "3-8005-44332-11-0",
    caseId: "MP-2026-0005",
    age: 55,
    ageGroup: "adult",
    gender: "male",
    location: "บ้านนบพิตำ",
    lastSeenDate: "2026-01-09",
    photoUrl: null,
    description: "หายไปขณะดินถล่มทับบ้าน",
    contactPhone: "081-555-0006",
    incidentId: "INC-2026-003",
  },
  {
    id: "10",
    type: "survivor",
    status: "safe",
    name: "มาลี สุวรรณ",
    citizenId: "3-8001-99887-66-5",
    caseId: "SV-2026-0003",
    age: 60,
    ageGroup: "elderly",
    gender: "female",
    location: "โรงพยาบาลนครศรีธรรมราช",
    lastSeenDate: "2026-01-10",
    photoUrl: null,
    description: "ได้รับบาดเจ็บเล็กน้อย อาการดีขึ้น",
    contactPhone: "081-555-0007",
    incidentId: "INC-2026-003",
  },
]

// ============================================
// API FUNCTIONS
// ============================================

// Create person record
export async function createPerson(data: Omit<Person, "id" | "caseId">): Promise<Person> {
  await delay(800)
  const id = Math.random().toString(36).substr(2, 9)
  const prefix = data.type === "missing-person" ? "MP" : data.type === "survivor" ? "SV" : "UB"
  const caseId = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`
  
  const newPerson: Person = {
    ...data,
    id,
    caseId,
  }
  
  personsStore = [newPerson, ...personsStore]
  return newPerson
}

// Fetch incidents from external service
export async function fetchIncidents(): Promise<Incident[]> {
  await delay(500)
  return mockIncidents
}

// Fetch active incidents only
export async function fetchActiveIncidents(): Promise<Incident[]> {
  await delay(300)
  return mockIncidents.filter((i) => i.incidentStatus === "active")
}

// Fetch single incident
export async function fetchIncident(incidentId: string): Promise<Incident | null> {
  await delay(200)
  return mockIncidents.find((i) => i.incidentId === incidentId) || null
}

// Fetch persons (optionally filtered by incident)
export async function fetchPersons(incidentId?: string): Promise<Person[]> {
  await delay(400)
  if (incidentId) {
    return personsStore.filter((p) => p.incidentId === incidentId)
  }
  return personsStore
}

// Fetch dashboard metrics
export async function fetchDashboardMetrics(incidentId?: string): Promise<DashboardMetrics> {
  await delay(300)
  const persons = incidentId
    ? personsStore.filter((p) => p.incidentId === incidentId)
    : personsStore

  return {
    totalMissing: persons.filter((p) => p.status === "missing").length,
    totalFound: persons.filter((p) => p.status === "found").length,
    totalSafe: persons.filter((p) => p.status === "safe").length,
    totalUnidentified: persons.filter((p) => p.status === "unidentified").length,
    openCases: persons.filter((p) => p.status === "missing" || p.status === "unidentified").length,
  }
}

// Get incident case counts
export async function fetchIncidentCaseCounts(): Promise<Record<string, number>> {
  await delay(200)
  const counts: Record<string, number> = {}
  personsStore.forEach((p) => {
    counts[p.incidentId] = (counts[p.incidentId] || 0) + 1
  })
  return counts
}

// Get unique provinces from incidents
export function getProvinces(): string[] {
  const provinces = new Set(mockIncidents.map((i) => i.province))
  return Array.from(provinces).sort()
}

// Get incident type label in Thai
export function getIncidentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    flood: "น้ำท่วม",
    fire: "ไฟไหม้/ไฟป่า",
    earthquake: "แผ่นดินไหว",
    storm: "พายุ",
    landslide: "ดินถล่ม",
    other: "อื่นๆ",
  }
  return labels[type] || type
}

// Get incident status label in Thai
export function getIncidentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "กำลังดำเนินการ",
    monitoring: "เฝ้าระวัง",
    resolved: "ปิดเคสแล้ว",
  }
  return labels[status] || status
}

// Re-export mock data that is used directly
export { mockLocationData, mockActivities, mockPotentialMatches, emergencyContacts } from "./mock-data"
