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
// MOCK PERSONS (managed by this service)
// ============================================
export const mockPersons: Person[] = [
  // ไฟป่าเชียงใหม่
  {
    id: "1",
    type: "missing-person",
    status: "missing",
    name: "สมชาย วงศ์ใหญ่",
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
  // พายุเพชรบุรี (resolved)
  {
    id: "11",
    type: "missing-person",
    status: "found",
    name: "สมศักดิ์ มงคล",
    caseId: "MP-2025-0089",
    age: 40,
    ageGroup: "adult",
    gender: "male",
    location: "ชายหาดชะอำ",
    lastSeenDate: "2025-12-21",
    photoUrl: null,
    description: "พบตัวปลอดภัยหลังพายุผ่านพ้น",
    contactPhone: "081-555-0008",
    incidentId: "INC-2025-089",
  },
  {
    id: "12",
    type: "survivor",
    status: "safe",
    name: "วันดี รุ่งโรจน์",
    caseId: "SV-2025-0089",
    age: 28,
    ageGroup: "adult",
    gender: "female",
    location: "ศูนย์พักพิงเพชรบุรี",
    lastSeenDate: "2025-12-22",
    photoUrl: null,
    description: "กลับบ้านแล้ว",
    contactPhone: "081-555-0009",
    incidentId: "INC-2025-089",
  },
]

// ============================================
// MOCK ACTIVITIES
// ============================================
export const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "new_report",
    message: "รายงานคนหายรายใหม่จากเหตุไฟป่า",
    location: "อ.แม่แตง, เชียงใหม่",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    caseId: "MP-2026-0001",
    incidentId: "INC-2026-001",
  },
  {
    id: "act-2",
    type: "status_update",
    message: "พบตัว สุนีย์ หมัดหมาน ปลอดภัย",
    location: "ศูนย์พักพิงหาดใหญ่",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    caseId: "MP-2026-0004",
    incidentId: "INC-2026-002",
  },
  {
    id: "act-3",
    type: "match_found",
    message: "พบเคสที่อาจมีความเกี่ยวข้อง",
    location: "โรงพยาบาลนครพิงค์",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    caseId: "SV-2026-0001",
    incidentId: "INC-2026-001",
  },
  {
    id: "act-4",
    type: "shelter_update",
    message: "ศูนย์พักพิงหาดใหญ่เปิดรับผู้อพยพเพิ่ม",
    location: "ศูนย์พักพิงหาดใหญ่",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    incidentId: "INC-2026-002",
  },
  {
    id: "act-5",
    type: "new_report",
    message: "รายงานผู้เสียชีวิตไม่ทราบตัวตน",
    location: "คลองอู่ตะเภา",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    caseId: "UB-2026-0002",
    incidentId: "INC-2026-002",
  },
]

// ============================================
// MOCK LOCATION DATA
// ============================================
export const mockLocationData: LocationData[] = [
  { name: "เชียงใหม่", missing: 2, found: 0, unidentified: 1, lat: 18.7883, lng: 98.9853 },
  { name: "หาดใหญ่", missing: 1, found: 1, unidentified: 1, lat: 7.0087, lng: 100.4741 },
  { name: "นครศรีธรรมราช", missing: 1, found: 0, unidentified: 0, lat: 8.4324, lng: 99.9631 },
  { name: "เพชรบุรี", missing: 0, found: 1, unidentified: 0, lat: 13.1119, lng: 99.9399 },
  { name: "เชียงราย", missing: 0, found: 0, unidentified: 0, lat: 19.9105, lng: 99.8406 },
]

// ============================================
// MOCK EMERGENCY CONTACTS
// ============================================
export const emergencyContacts: EmergencyContact[] = [
  {
    id: "ec-1",
    name: "สายด่วนแจ้งเหตุฉุกเฉินแห่งชาติ",
    phone: "191",
    description: "สำหรับเหตุฉุกเฉินที่คุกคามต่อชีวิตและความช่วยเหลือทันที",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "ec-2",
    name: "ศูนย์บัญชาการบรรเทาสาธารณภัย",
    phone: "1784",
    description: "การประสานงานกลางสำหรับการปฏิบัติการบรรเทาสาธารณภัยทั้งหมด",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "ec-3",
    name: "สายด่วนประสานงานครอบครัว",
    phone: "1300",
    description: "รายงานหรือสอบถามเกี่ยวกับสมาชิกในครอบครัวที่สูญหาย",
    available: "06:00 - 23:00 น.",
    priority: "high",
  },
  {
    id: "ec-4",
    name: "สายด่วนช่วยเหลือทางการแพทย์",
    phone: "1669",
    description: "สอบถามข้อมูลทางการแพทย์ที่ไม่ฉุกเฉินและข้อมูลโรงพยาบาล",
    available: "24/7",
    priority: "high",
  },
  {
    id: "ec-5",
    name: "สายด่วนสุขภาพจิต",
    phone: "1323",
    description: "การปรึกษาวิกฤตและบริการสนับสนุนทางอารมณ์",
    available: "24/7",
    priority: "normal",
  },
]

// ============================================
// MOCK POTENTIAL MATCHES
// ============================================
export const mockPotentialMatches: PotentialMatch[] = [
  {
    id: "match-1",
    confidence: 78,
    missingPerson: mockPersons[0],
    foundPerson: mockPersons[2],
    matchingFeatures: ["ช่วงอายุ", "เพศ", "พื้นที่เหตุการณ์เดียวกัน"],
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
]

// ============================================
// API FUNCTIONS
// ============================================

// Fetch incidents from external service
export async function fetchIncidents(): Promise<Incident[]> {
  await delay(500) // Simulate network delay
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
    return mockPersons.filter((p) => p.incidentId === incidentId)
  }
  return mockPersons
}

// Fetch activities (optionally filtered by incident)
export async function fetchActivities(incidentId?: string): Promise<ActivityItem[]> {
  await delay(300)
  if (incidentId) {
    return mockActivities.filter((a) => a.incidentId === incidentId)
  }
  return mockActivities
}

// Fetch dashboard metrics
export async function fetchDashboardMetrics(incidentId?: string): Promise<DashboardMetrics> {
  await delay(300)
  const persons = incidentId
    ? mockPersons.filter((p) => p.incidentId === incidentId)
    : mockPersons

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
  mockPersons.forEach((p) => {
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
