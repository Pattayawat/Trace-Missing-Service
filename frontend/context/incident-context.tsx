"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import { fetchIncidents, fetchActiveIncidents } from "@/lib/api"
import type { Incident } from "@/lib/types"

interface IncidentContextType {
  // Selected incident state
  selectedIncidentId: string | null
  selectedIncident: Incident | null
  setSelectedIncidentId: (id: string | null) => void

  // All incidents
  incidents: Incident[]
  activeIncidents: Incident[]
  isLoading: boolean
  error: Error | null

  // View mode for dashboard
  viewMode: "global" | "incident"
  setViewMode: (mode: "global" | "incident") => void

  // Utility functions
  getIncidentById: (id: string) => Incident | undefined
  refreshIncidents: () => void
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined)

interface IncidentProviderProps {
  children: ReactNode
}

export function IncidentProvider({ children }: IncidentProviderProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"global" | "incident">("global")

  // Fetch all incidents
  const {
    data: incidents = [],
    error,
    isLoading,
    mutate: refreshIncidents,
  } = useSWR("incidents", fetchIncidents, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  // Fetch active incidents
  const { data: activeIncidents = [] } = useSWR("active-incidents", fetchActiveIncidents, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  // Get selected incident object
  const selectedIncident = selectedIncidentId
    ? incidents.find((i) => i.incidentId === selectedIncidentId) || null
    : null

  // Utility to get incident by ID
  const getIncidentById = useCallback(
    (id: string) => incidents.find((i) => i.incidentId === id),
    [incidents]
  )

  // Handle incident selection and auto-switch view mode
  const handleSetSelectedIncidentId = useCallback((id: string | null) => {
    setSelectedIncidentId(id)
    if (id) {
      setViewMode("incident")
    }
  }, [])

  const value: IncidentContextType = {
    selectedIncidentId,
    selectedIncident,
    setSelectedIncidentId: handleSetSelectedIncidentId,
    incidents,
    activeIncidents,
    isLoading,
    error: error || null,
    viewMode,
    setViewMode,
    getIncidentById,
    refreshIncidents,
  }

  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>
}

export function useIncident() {
  const context = useContext(IncidentContext)
  if (context === undefined) {
    throw new Error("useIncident must be used within an IncidentProvider")
  }
  return context
}

// Hook to get persons filtered by selected incident
export function useIncidentFilter() {
  const { selectedIncidentId, viewMode } = useIncident()
  
  const shouldFilterByIncident = viewMode === "incident" && selectedIncidentId !== null
  
  return {
    incidentId: shouldFilterByIncident ? selectedIncidentId : undefined,
    isFiltered: shouldFilterByIncident,
  }
}
