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
export async function createPerson(data: Omit<Person, "id" | "caseId"> & { photo?: File | null }): Promise<Person> {
  let photoUrl = data.photoUrl;

  // 1. Handle Photo Upload if File is provided
  if (data.photo && API_URL) {
    try {
      const uploadRes = await fetch(`${API_URL}/reports/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: data.photo.name,
          contentType: data.photo.type,
        }),
      });
      
      if (uploadRes.ok) {
        const { uploadUrl, photoUrl: publicUrl } = await uploadRes.json();
        
        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: data.photo,
          headers: { 'Content-Type': data.photo.type },
        });
        
        photoUrl = publicUrl;
      }
    } catch (e) {
      console.error("Photo upload failed", e);
    }
  }

  if (!API_URL) {
    await delay(800);
    return { ...data, id: Math.random().toString(), caseId: "MP-MOCK", photoUrl: photoUrl || null };
  }

  // Split name for backend
  const [firstName = "", ...rest] = (data.name || "").split(" ");
  const lastName = rest.join(" ");

  // Map person type to reportType
  const reportTypeMap: Record<string, string> = {
    "missing-person": "missing-person",
    "survivor": "unidentified-victim",
    "unidentified-body": "unidentified-deceased"
  };

  const response = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      incidentId: data.incidentId,
      details: data.name ? `${data.name} - ${data.description}` : data.description,
      photoUrl: photoUrl,
      location: data.location,
      firstName: firstName,
      lastName: lastName,
      gender: data.gender,
      ageCategory: data.ageGroup,
      age: data.age,
      reportType: reportTypeMap[data.type] || "missing-person",
      isUnidentified: data.type !== "missing-person",
      lifeStatus: data.type === "unidentified-body" ? "DEAD" : "ALIVE"
    }),
  });

  if (!response.ok) throw new Error('Failed to create report');
  
  const result = await response.json();
  
  return {
    ...data,
    id: result.id.toString(),
    caseId: `MP-2026-${result.id}`,
    photoUrl: result.photo_url || photoUrl || null,
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

// Fetch persons (optionally filtered by incident and type)
export async function fetchPersons(incidentId?: string, type?: Person["type"]): Promise<Person[]> {
  if (!API_URL) return [];

  try {
    const url = new URL(`${API_URL}/reports`);
    if (incidentId) url.searchParams.append('incidentId', incidentId);
    
    // Map internal type to reportType
    const reportTypeMap: Record<string, string> = {
      "missing-person": "missing-person",
      "survivor": "unidentified-victim",
      "unidentified-body": "unidentified-deceased"
    };
    if (type) url.searchParams.append('reportType', reportTypeMap[type]);
    
    const response = await fetch(url.toString());
    if (!response.ok) return [];
    const data = await response.json();
    
    return data.map((r: any) => {
      // Reverse map reportType to internal type
      let personType: Person["type"] = "missing-person";
      if (r.report_type === "unidentified-victim") personType = "survivor";
      if (r.report_type === "unidentified-deceased") personType = "unidentified-body";

      return {
        id: r.id.toString(),
        type: personType,
        status: r.status === 'pending' ? 'missing' : 'found',
        name: r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.details?.split(' - ')[0] || null),
        citizenId: null,
        caseId: `MP-2026-${r.id}`,
        ageGroup: r.age_category || "adult",
        age: r.age,
        gender: r.gender || "unknown",
        location: r.location || "Unknown",
        lastSeenDate: r.created_at,
        photoUrl: r.photo_url || null,
        description: r.details?.split(' - ')[1] || r.details || "",
        incidentId: r.incident_id,
      };
    });
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
    totalMissing: persons.filter((p) => p.type === "missing-person").length,
    totalFound: persons.filter((p) => p.status === "found").length,
    totalSafe: persons.filter((p) => p.type === "survivor").length,
    totalUnidentified: persons.filter((p) => p.type === "unidentified-body").length,
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
