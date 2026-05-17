import type {
  Incident,
  Person,
  ActivityItem,
  LocationData,
  EmergencyContact,
  PotentialMatch,
  DashboardMetrics,
} from "./types"
import { 
  mockLocationData, 
  mockActivities, 
  mockPotentialMatches, 
  emergencyContacts 
} from "./mock-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const INCIDENT_API_URL = process.env.NEXT_PUBLIC_INCIDENT_API_URL || "";
const INCIDENT_API_KEY = process.env.NEXT_PUBLIC_INCIDENT_API_KEY || "";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================
// MOCK DATA (Fallback)
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
]

// ============================================
// API FUNCTIONS
// ============================================

// Create person record (maps to Report in backend lite)
export async function createPerson(data: Omit<Person, "id" | "caseId">): Promise<Person> {
  if (!API_URL) {
    await delay(800);
    return { ...data, id: Math.random().toString(), caseId: "MP-MOCK" };
  }

  const response = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      incidentId: parseInt(data.incidentId.split('-').pop() || "1"),
      details: `${data.name} - ${data.description}`,
    }),
  });

  if (!response.ok) throw new Error('Failed to create report');
  
  const result = await response.json();
  
  return {
    ...data,
    id: result.id.toString(),
    caseId: `MP-2026-${result.id}`,
  };
}

// Fetch incidents from external service
export async function fetchIncidents(): Promise<Incident[]> {
  if (!INCIDENT_API_URL) return mockIncidents;

  try {
    const response = await fetch(INCIDENT_API_URL, {
      method: 'GET',
      headers: {
        'api-key': INCIDENT_API_KEY,
        'X-IncidentTNX-Id': '123E4567-E89B-12D3-A456-426614174000', // Example UUID as requested
      },
    });

    if (!response.ok) {
      console.warn(`External Incident API returned ${response.status}. Falling back to mocks.`);
      return mockIncidents;
    }

    const data = await response.json();
    
    // Map external API fields to internal Incident type
    return data.map((i: any) => ({
      incidentId: i.incident_id,
      incidentName: i.incident_description || "Incident",
      incidentType: i.incident_type || "other",
      province: i.province || "Unknown",
      location: i.exact_location_description || i.exact_location || "Unknown",
      incidentStatus: i.status === "REPORTED" ? "active" : "monitoring",
      startDate: i.created_at,
      description: i.incident_description,
    }));
  } catch (e) {
    console.error("Failed to fetch external incidents:", e);
    return mockIncidents;
  }
}

// Fetch active incidents only
export async function fetchActiveIncidents(): Promise<Incident[]> {
  const incidents = await fetchIncidents();
  return incidents.filter((i) => i.incidentStatus === "active" || i.incidentStatus === "monitoring")
}

// Fetch single incident
export async function fetchIncident(incidentId: string): Promise<Incident | null> {
  const incidents = await fetchIncidents();
  return incidents.find((i) => i.incidentId === incidentId) || null
}

// Fetch persons (optionally filtered by incident)
export async function fetchPersons(incidentId?: string): Promise<Person[]> {
  if (!API_URL) return [];

  try {
    const response = await fetch(`${API_URL}/reports`);
    if (!response.ok) return [];
    const data = await response.json();
    
    const persons: Person[] = data.map((r: any) => ({
      id: r.id.toString(),
      type: "missing-person",
      status: r.status === 'pending' ? 'missing' : 'found',
      name: r.details?.split(' - ')[0] || "Unknown",
      citizenId: null,
      caseId: `MP-2026-${r.id}`,
      ageGroup: "adult",
      gender: "other",
      location: "Unknown",
      lastSeenDate: r.created_at,
      photoUrl: null,
      description: r.details?.split(' - ')[1] || r.details || "",
      incidentId: `INC-2026-${r.incident_id}`,
    }));

    if (incidentId) {
      return persons.filter((p) => p.incidentId === incidentId)
    }
    return persons;
  } catch (e) {
    return [];
  }
}

// Fetch activities (optionally filtered by incident)
export async function fetchActivities(incidentId?: string): Promise<ActivityItem[]> {
  await delay(300)
  if (incidentId) {
    return mockActivities.filter((a: ActivityItem) => a.incidentId === incidentId)
  }
  return mockActivities
}

// Fetch dashboard metrics
export async function fetchDashboardMetrics(incidentId?: string): Promise<DashboardMetrics> {
  const persons = await fetchPersons(incidentId);

  return {
    totalMissing: persons.filter((p) => p.status === "missing").length,
    totalFound: persons.filter((p) => p.status === "found").length,
    totalSafe: 0,
    totalUnidentified: 0,
    openCases: persons.filter((p) => p.status === "missing").length,
  }
}

// Get incident case counts
export async function fetchIncidentCaseCounts(): Promise<Record<string, number>> {
  const persons = await fetchPersons();
  const counts: Record<string, number> = {}
  persons.forEach((p) => {
    counts[p.incidentId] = (counts[p.incidentId] || 0) + 1
  })
  return counts
}

// Get unique provinces from incidents
export function getProvinces(): string[] {
  return ["เชียงใหม่", "สงขลา", "กรุงเทพฯ", "นครศรีธรรมราช"]
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
export { mockLocationData, mockActivities, mockPotentialMatches, emergencyContacts }
