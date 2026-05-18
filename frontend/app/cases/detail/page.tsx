import CaseDetail from "@/components/cases/case-detail"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function CaseDetailLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<CaseDetailLoading />}>
      <CaseDetail />
    </Suspense>
  )
}
