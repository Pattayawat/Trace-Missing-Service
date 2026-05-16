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
    name: "ข้อมูลศูนย์พักพิง",
    phone: "02-XXX-XXXX",
    description: "ค้นหาศูนย์พักพิงที่ว่างและอัปเดตความจุ",
    available: "08:00 - 22:00 น.",
    priority: "normal",
  },
  {
    id: "ec-6",
    name: "สายด่วนสุขภาพจิต",
    phone: "1323",
    description: "การปรึกษาวิกฤตและบริการสนับสนุนทางอารมณ์",
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
      name: "มาเรีย ซานโตส",
      caseId: "MP-2024-0891",
      age: 34,
      ageGroup: "adult",
      gender: "female",
      location: "พื้นที่ศูนย์พักพิงกลางเมือง, บล็อก 5",
      lastSeenDate: "2024-01-15",
      photoUrl: null,
      description: "พบครั้งสุดท้ายสวมเสื้อแจ็คเก็ตสีน้ำเงิน, ผมสีเข้ม, สูงประมาณ 162 ซม.",
      contactPhone: "081-555-0123",
    },
    foundPerson: {
      id: "sv-match-1",
      type: "survivor",
      status: "safe",
      name: "หญิงไม่ทราบชื่อ",
      caseId: "SV-2024-0161",
      age: 35,
      ageGroup: "adult",
      gender: "female",
      location: "โรงพยาบาลกลาง, วอร์ด 2A",
      lastSeenDate: "2024-01-16",
      photoUrl: null,
      description: "ผมสีเข้ม, สูงประมาณ 162 ซม., พบเสื้อผ้าสีน้ำเงินอยู่ใกล้ๆ",
    },
    matchingFeatures: ["ช่วงอายุ", "เพศ", "สีผม", "ส่วนสูง", "ลักษณะเสื้อผ้า"],
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "match-2",
    confidence: 72,
    missingPerson: {
      id: "mp-match-2",
      type: "missing-person",
      status: "missing",
      name: "โทมัส วิลเลียมส์",
      caseId: "MP-2024-0893",
      age: 78,
      ageGroup: "elderly",
      gender: "male",
      location: "หมู่บ้านซันเซ็ตไฮตส์",
      lastSeenDate: "2024-01-15",
      photoUrl: null,
      description: "ใช้ไม้เท้าพยุงเดิน, สวมแว่นตา, มีปัญหาทางการได้ยิน",
      contactPhone: "081-555-0127",
    },
    foundPerson: {
      id: "sv-match-2",
      type: "survivor",
      status: "safe",
      name: "ชายสูงอายุไม่ทราบชื่อ",
      caseId: "SV-2024-0162",
      age: 75,
      ageGroup: "elderly",
      gender: "male",
      location: "โรงพยาบาลเมโมเรียล, ห้อง 315",
      lastSeenDate: "2024-01-16",
      photoUrl: null,
      description: "ชายสูงอายุสวมแว่นตา, ใช้อุปกรณ์ช่วยเดิน, มีปัญหาทางการสื่อสาร",
    },
    matchingFeatures: ["ช่วงอายุ", "เพศ", "แว่นตา", "อุปกรณ์ช่วยเดิน", "ปัญหาทางการได้ยิน"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
    message: "รายงานผู้รอดชีวิตรายใหม่ที่โรงพยาบาลกลาง",
    location: "โรงพยาบาลกลาง, วอร์ด 3B",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    caseId: "SV-2024-0160",
  },
  {
    id: "act-2",
    type: "status_update",
    message: "อัปเดตสถานะของ มาเรีย ซานโตส",
    location: "พื้นที่ศูนย์พักพิงกลางเมือง",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    caseId: "MP-2024-0891",
  },
  {
    id: "act-3",
    type: "match_found",
    message: "พบเคสที่อาจมีความเกี่ยวข้องกับบุคคลไม่ทราบตัวตน",
    location: "ริมแม่น้ำฝั่งตะวันตก",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    caseId: "UB-2024-0034",
  },
  {
    id: "act-4",
    type: "shelter_update",
    message: "ความจุของศูนย์พักพิง A ถึง 85% แล้ว",
    location: "ศูนย์พักพิงชุมชน",
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: "act-5",
    type: "new_report",
    message: "ยื่นรายงานคนหายรายใหม่",
    location: "เขตเหนือ",
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    caseId: "MP-2024-0896",
  },
  {
    id: "act-6",
    type: "status_update",
    message: "โรเบิร์ต เฉิน ได้กลับไปพบกับครอบครัวแล้ว",
    location: "ค่ายบรรเทาทุกข์ตะวันออก",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    caseId: "MP-2024-0889",
  },
  {
    id: "act-7",
    type: "shelter_update",
    message: "เสบียงใหม่มาถึงโรงพยาบาลเมโมเรียล",
    location: "โรงพยาบาลเมโมเรียล",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "act-8",
    type: "new_report",
    message: "พบบุคคลไม่ทราบตัวตนใกล้สะพาน",
    location: "พื้นที่สะพานใต้",
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
  { name: "ใจกลางเมือง", missing: 12, found: 8, unidentified: 2, lat: 40.7128, lng: -74.006 },
  { name: "เขตเหนือ", missing: 8, found: 5, unidentified: 1, lat: 40.7580, lng: -73.9855 },
  { name: "ริมแม่น้ำฝั่งตะวันตก", missing: 15, found: 3, unidentified: 4, lat: 40.7282, lng: -74.0776 },
  { name: "ฝั่งตะวันออก", missing: 6, found: 9, unidentified: 0, lat: 40.7614, lng: -73.9776 },
  { name: "สะพานใต้", missing: 10, found: 4, unidentified: 3, lat: 40.6892, lng: -74.0445 },
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
    name: "มาเรีย ซานโตส",
    caseId: "MP-2024-0891",
    age: 34,
    ageGroup: "adult",
    gender: "female",
    location: "พื้นที่ศูนย์พักพิงกลางเมือง, บล็อก 5",
    lastSeenDate: "2024-01-15",
    photoUrl: null,
    description: "พบครั้งสุดท้ายสวมเสื้อแจ็คเก็ตสีน้ำเงินและกางเกงยีนส์",
    contactPhone: "081-555-0123",
  },
  {
    id: "2",
    type: "missing-person",
    status: "missing",
    name: "เจมส์ โรดริเกซ",
    caseId: "MP-2024-0892",
    age: 8,
    ageGroup: "child",
    gender: "male",
    location: "เขตเหนือ, ใกล้โรงเรียนหมายเลข 12",
    lastSeenDate: "2024-01-14",
    photoUrl: null,
    description: "สะพายเป้สีแดงและสวมเสื้อเชิ้ตสีเขียว",
    contactPhone: "081-555-0124",
  },
  {
    id: "3",
    type: "survivor",
    status: "safe",
    name: "เอเลน่า คิม",
    caseId: "SV-2024-0156",
    age: 67,
    ageGroup: "elderly",
    gender: "female",
    location: "โรงพยาบาลกลาง, วอร์ด 3B",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "อาการคงที่, บาดเจ็บเล็กน้อย",
    contactPhone: "081-555-0125",
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
    location: "ริมแม่น้ำฝั่งตะวันตก, กริต C-7",
    lastSeenDate: "2024-01-13",
    photoUrl: null,
    description: "สูงประมาณ 178 ซม., ผมสีเข้ม, มีรอยสักที่แขนซ้าย",
  },
  {
    id: "5",
    type: "missing-person",
    status: "found",
    name: "โรเบิร์ต เฉิน",
    caseId: "MP-2024-0889",
    age: 52,
    ageGroup: "adult",
    gender: "male",
    location: "ค่ายบรรเทาทุกข์ตะวันออก",
    lastSeenDate: "2024-01-12",
    photoUrl: null,
    description: "พบตัวปลอดภัยที่ศูนย์พักพิงเมื่อวันที่ 16 ม.ค.",
    contactPhone: "081-555-0126",
  },
  {
    id: "6",
    type: "survivor",
    status: "safe",
    name: "หญิงไม่ทราบชื่อ",
    caseId: "SV-2024-0157",
    age: 25,
    ageGroup: "adult",
    gender: "female",
    location: "ไอซียู โรงพยาบาลเมโมเรียล",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "ไม่สามารถสื่อสารได้, กำลังระบุตัวตน",
  },
  {
    id: "7",
    type: "missing-person",
    status: "missing",
    name: "โทมัส วิลเลียมส์",
    caseId: "MP-2024-0893",
    age: 78,
    ageGroup: "elderly",
    gender: "male",
    location: "หมู่บ้านซันเซ็ตไฮตส์",
    lastSeenDate: "2024-01-15",
    photoUrl: null,
    description: "ใช้ไม้เท้าพยุงเดิน, สวมแว่นตา, มีปัญหาทางการได้ยิน",
    contactPhone: "081-555-0127",
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
    location: "พื้นที่สะพานใต้",
    lastSeenDate: "2024-01-14",
    photoUrl: null,
    description: "สูงประมาณ 165 ซม., ผมสีบลอนด์, สวมชุดกระโปรงลายดอกไม้",
  },
  {
    id: "9",
    type: "survivor",
    status: "safe",
    name: "เดวิด พาร์ค",
    caseId: "SV-2024-0158",
    age: 42,
    ageGroup: "adult",
    gender: "male",
    location: "ศูนย์พักพิงชุมชน",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "สภาพร่างกายดี, กำลังตามหาครอบครัว",
    contactPhone: "081-555-0128",
  },
  {
    id: "10",
    type: "missing-person",
    status: "missing",
    name: "โซฟี แอนเดอร์สัน",
    caseId: "MP-2024-0894",
    age: 16,
    ageGroup: "teen",
    gender: "female",
    location: "พื้นที่โรงเรียนมัธยมกลาง",
    lastSeenDate: "2024-01-15",
    photoUrl: null,
    description: "ชุดนักเรียน, เคสโทรศัพท์สีชมพู",
    contactPhone: "081-555-0129",
  },
  {
    id: "11",
    type: "survivor",
    status: "safe",
    name: "ไมเคิล บราวน์",
    caseId: "SV-2024-0159",
    age: 55,
    ageGroup: "adult",
    gender: "male",
    location: "โรงพยาบาลเซนต์แมรี่, ห้อง 412",
    lastSeenDate: "2024-01-16",
    photoUrl: null,
    description: "กำลังพักฟื้นจากอาการบาดเจ็บที่ขา",
    contactPhone: "081-555-0130",
  },
  {
    id: "12",
    type: "missing-person",
    status: "missing",
    name: "ลิซ่า มาร์ติเนซ",
    caseId: "MP-2024-0895",
    age: 29,
    ageGroup: "adult",
    gender: "female",
    location: "กรีนวูดอพาร์ตเมนต์",
    lastSeenDate: "2024-01-14",
    photoUrl: null,
    description: "ตั้งครรภ์ 7 เดือน, สวมชุดคลุมท้อง",
    contactPhone: "081-555-0131",
  },
]
