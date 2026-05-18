import IncidentDetailContent from "@/components/incidents/incident-detail-content"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

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

function IncidentDetailLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  )
}

export default function IncidentDetailPage() {
  return (
    <Suspense fallback={<IncidentDetailLoading />}>
      <IncidentDetailContent />
    </Suspense>
  )
}
