import type { Application } from "../types"

export type StatusFilterValue = "all" | Application["status"]

export function filterApplications(
  applications: Application[],
  searchTerm: string,
  statusFilter: StatusFilterValue,
): Application[] {
  return applications.filter(app => {
    const matchesSearch =
      searchTerm === "" ||
      String(app.id).includes(searchTerm) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.grant.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })
}
