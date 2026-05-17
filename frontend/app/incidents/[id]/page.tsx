import IncidentDetailContent from "@/components/incidents/incident-detail-content"

// To support static export, we need to generate params for dynamic routes
export function generateStaticParams() {
  // These should ideally match the IDs returned by fetchIncidents/mockIncidents
  return [
    { id: 'INC-2026-001' },
    { id: 'INC-2026-002' },
    { id: 'INC-2026-003' },
    { id: 'INC-2025-089' },
    { id: 'INC-2025-088' },
  ]
}

export default function IncidentDetailPage() {
  return <IncidentDetailContent />
}
