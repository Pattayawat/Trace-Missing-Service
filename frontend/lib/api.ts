import type {
  Incident,
  Person,
  ActivityItem,
  LocationData,
  EmergencyContact,
  PotentialMatch,
  DashboardMetrics,
  CaseDetail,
} from "./types"
import { 
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
        status: r.status, // PASS REAL DATABASE STATUS
        name: r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.details?.split(' - ')[0] || null),
        citizenId: r.citizen_id || null,
        caseId: `MP-2026-${r.id}`,
        ageGroup: r.age_category || "adult",
        age: r.age,
        gender: r.gender || "unknown",
        location: r.location || "Unknown",
        lastSeenDate: r.created_at,
        photoUrl: r.photo_url || null,
        description: r.details?.split(' - ')[1] || r.details || "",
        incidentId: r.incident_id,
        latitude: r.latitude,
        longitude: r.longitude,
      };
    });
  } catch (e) {
    return [];
  }
}

// Fetch activities (optionally filtered by incident)
export async function fetchActivities(incidentId?: string): Promise<ActivityItem[]> {
  const persons = await fetchPersons(incidentId);
  
  // Create real activities from person reports
  const activities: ActivityItem[] = persons.slice(0, 10).map((p) => ({
    id: `act-${p.id}`,
    type: (p.status === 'REUNITED' || p.status === 'VERIFIED') ? 'status_update' : 'new_report',
    message: (p.status === 'REUNITED' || p.status === 'VERIFIED') ? `พบตัว ${p.name || 'บุคคลนิรนาม'} แล้ว` : `รับแจ้งเหตุ ${p.type === 'missing-person' ? 'คนหาย' : 'บุคคลนิรนาม'} ใหม่: ${p.name || 'ไม่ทราบชื่อ'}`,
    location: p.location,
    timestamp: new Date(p.lastSeenDate),
    caseId: p.caseId,
    incidentId: p.incidentId
  }));

  return activities.length > 0 ? activities : mockActivities;
}

// Fetch dashboard metrics
export async function fetchDashboardMetrics(incidentId?: string): Promise<DashboardMetrics> {
  if (!API_URL) {
     return { totalMissing: 0, totalFound: 0, totalSafe: 0, totalUnidentified: 0, openCases: 0 };
  }

  try {
    const url = new URL(`${API_URL}/stats`);
    if (incidentId) url.searchParams.append('incidentId', incidentId);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();

    return {
      totalMissing: parseInt(data.total_missing),
      totalFound: parseInt(data.total_found),
      totalSafe: parseInt(data.total_safe),
      totalUnidentified: parseInt(data.total_unidentified),
      openCases: parseInt(data.open_cases),
    };
  } catch (e) {
    console.error("Failed to fetch dashboard metrics", e);
    return { totalMissing: 0, totalFound: 0, totalSafe: 0, totalUnidentified: 0, openCases: 0 };
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

// Generate location data for the map based on real reports
export async function fetchLocationData(): Promise<LocationData[]> {
  const persons = await fetchPersons();
  const locationMap: Record<string, LocationData> = {};

  // Hardcoded coordinates for some demo locations
  const coordinates: Record<string, {lat: number, lng: number}> = {
    "กรุงเทพฯ": { lat: 13.7563, lng: 100.5018 },
    "เชียงใหม่": { lat: 18.7883, lng: 98.9853 },
    "สงขลา": { lat: 7.1898, lng: 100.5954 },
    "Bangkok": { lat: 13.7563, lng: 100.5018 },
    "Chiang Mai": { lat: 18.7883, lng: 98.9853 },
    "สามย่าน": { lat: 13.7334, lng: 100.5284 },
    "EggHead": { lat: 14.0649, lng: 100.6003 }, // TU Dome area
  };

  persons.forEach((p) => {
    const locName = p.location.split(',')[0].trim();
    if (!locationMap[locName]) {
      // Use report's coordinates if available, otherwise fallback to hardcoded or random
      const lat = p.latitude || coordinates[locName]?.lat || 13.7563 + (Math.random() - 0.5);
      const lng = p.longitude || coordinates[locName]?.lng || 100.5018 + (Math.random() - 0.5);
      
      locationMap[locName] = {
        name: locName,
        missing: 0,
        found: 0,
        unidentified: 0,
        lat: Number(lat),
        lng: Number(lng)
      };
    }

    if (p.status === 'ACTIVE' || p.status === 'REPORTED') locationMap[locName].missing++;
    if (p.status === 'REUNITED' || p.status === 'VERIFIED') locationMap[locName].found++;
    if (p.type === 'unidentified-body') locationMap[locName].unidentified++;
  });

  return Object.values(locationMap);
}

// Fetch potential matches for reunification
export async function fetchPotentialMatches(): Promise<PotentialMatch[]> {
  if (!API_URL) return mockPotentialMatches;

  try {
    const response = await fetch(`${API_URL}/reunifications`);
    if (!response.ok) return [];
    const data = await response.json();
    
    return data.map((r: any) => {
      // Missing Person details
      const missingPerson: Person = {
        id: r.report_id.toString(),
        type: "missing-person",
        status: r.person_status, // PASS REAL STATUS
        name: r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.report_details?.split(' - ')[0] || "Unknown"),
        citizenId: r.citizen_id || null,
        caseId: `MP-2026-${r.report_id}`,
        ageGroup: r.age_category || "adult",
        age: r.age,
        gender: r.gender || "unknown",
        location: r.current_location || "Unknown",
        lastSeenDate: r.matched_at,
        photoUrl: r.photo_url || null,
        description: r.report_details?.split(' - ')[1] || r.report_details || "",
        incidentId: r.incident_id,
      };

      // Matched Person (could be another report OR shelter info from details)
      let matchedPerson: Person;
      
      if (r.matched_report_id) {
        // Match between two reports in system (e.g. Missing ↔ Unidentified Victim)
        let matchedType: Person["type"] = "missing-person";
        if (r.matched_report_type === "unidentified-victim") matchedType = "survivor";
        if (r.matched_report_type === "unidentified-deceased") matchedType = "unidentified-body";

        matchedPerson = {
          id: r.matched_report_id.toString(),
          type: matchedType,
          status: r.matched_person_status, // PASS REAL STATUS
          name: r.matched_first_name && r.matched_last_name ? `${r.matched_first_name} ${r.matched_last_name}` : (r.matched_details?.split(' - ')[0] || "บุคคลไม่ทราบตัวตน"),
          citizenId: null,
          caseId: `MP-2026-${r.matched_report_id}`,
          ageGroup: r.matched_age_category || "adult",
          age: null,
          gender: r.matched_gender || "unknown",
          location: r.matched_location || "Unknown",
          lastSeenDate: r.matched_at,
          photoUrl: r.matched_photo_url || null,
          description: r.matched_details?.split(' - ')[1] || r.matched_details || "",
          incidentId: r.matched_incident_id,
        };
      } else {
        // Match with external shelter data stored in JSONB details
        matchedPerson = {
          id: `ext-${r.id}`,
          type: "survivor",
          status: "ACTIVE",
          name: r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : "บุคคลไม่ทราบตัวตน",
          citizenId: null,
          caseId: "EXT-MATCH",
          ageGroup: "adult",
          age: null,
          gender: r.gender || "unknown",
          location: r.details?.shelterId ? `Shelter ${r.details.shelterId}` : r.current_location,
          lastSeenDate: r.matched_at,
          photoUrl: r.photo_url || null,
          description: `Matched via: ${r.details?.matchedVia || 'System'}. Latest location reported by external service.`,
          incidentId: r.incident_id,
        };
      }

      return {
        id: r.id.toString(),
        missingPerson,
        matchedPerson,
        confidence: 0.95,
        status: r.status as any,
        matchDate: r.matched_at,
        locationHistory: [
          {
            location: r.current_location,
            timestamp: r.matched_at,
            type: r.details?.shelterId ? "shelter" : "hospital",
            description: r.details?.shelterId ? `Checked in at shelter ${r.details.shelterId}` : "Transferred to hospital"
          }
        ]
      };
    });
  } catch (e) {
    console.error("Failed to fetch reunifications:", e);
    return [];
  }
}

// Update person status
export async function updatePersonStatus(id: string, status: string): Promise<boolean> {
  if (!API_URL) return true;

  try {
    const response = await fetch(`${API_URL}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    return response.ok;
  } catch (e) {
    console.error("Failed to update status", e);
    return false;
  }
}

// Fetch full case detail with timeline and matches
export async function fetchCaseDetail(id: string): Promise<CaseDetail | null> {
  if (!API_URL) return null;

  try {
    const response = await fetch(`${API_URL}/reports/${id}/detail`);
    if (!response.ok) return null;
    const data = await response.json();
    
    // Map person in detail
    const r = data.person;
    let personType: Person["type"] = "missing-person";
    if (r.report_type === "unidentified-victim") personType = "survivor";
    if (r.report_type === "unidentified-deceased") personType = "unidentified-body";

    data.person = {
      id: r.id.toString(),
      type: personType,
      status: r.status,
      name: r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.details?.split(' - ')[0] || null),
      citizenId: r.citizen_id || null,
      caseId: `MP-2026-${r.id}`,
      ageGroup: r.age_category || "adult",
      age: r.age,
      gender: r.gender || "unknown",
      location: r.location || "Unknown",
      lastSeenDate: r.created_at,
      photoUrl: r.photo_url || null,
      description: r.details?.split(' - ')[1] || r.details || "",
      incidentId: r.incident_id,
      latitude: r.latitude,
      longitude: r.longitude,
    };

    return data as CaseDetail;
  } catch (e) {
    console.error("Failed to fetch case detail", e);
    return null;
  }
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
export { mockActivities, mockPotentialMatches, emergencyContacts }
