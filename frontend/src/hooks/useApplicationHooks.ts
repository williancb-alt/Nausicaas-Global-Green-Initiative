import { useQuery } from "@tanstack/react-query"
import type { Application } from "../types"

// dummy data for frontend dev
const mockApplications: Application[] = [
  {
    id: "APP-001",
    userId: "user-1",
    grantId: "grant-1",
    grantTitle: "Climate Resilience Fund",
    submittedDate: "2026-01-15",
    status: "pending_review",
    fullName: "Aisha Bello",
    organization: "Green Farms Co-op",
    email: "aisha@example.com",
    projectTitle: "Water Retention Ponds",
    projectPurpose: "Reduce seasonal flooding and preserve topsoil",
    requestedAmount: 50000,
    projectDescription: "Construct three retention ponds to capture runoff...",
    documents: [],
  },
  {
    id: "APP-002",
    userId: "user-2",
    grantId: "grant-2",
    grantTitle: "Mangrove Restoration Grant",
    submittedDate: "2026-01-20",
    status: "in_review",
    fullName: "Diego Rivera",
    organization: "CoastalCare",
    email: "diego@example.org",
    projectTitle: "Community Mangrove Nursery",
    projectPurpose: "Restore 10 hectares of mangrove",
    requestedAmount: 75000,
    projectDescription: "Establish nursery and community planting program...",
    documents: [],
  },
]

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      // For now, return mock data. Replace with API call once ready
      return { items: mockApplications }
    },
  })
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: async () => {
      return mockApplications.find(a => a.id === id) ?? null
    },
    enabled: !!id,
  })
}
