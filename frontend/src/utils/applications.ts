import type { Application } from "../types"

export type StatusFilterValue = "all" | Application["status"]
export const NO_AWARD_FILTER_VALUE = "__no_award__"
export type AwardFilterValue = string

function hasAward(application: Application): boolean {
  return Boolean(application.award?.name?.trim())
}

function matchesSearchTerm(
  application: Application,
  normalizedSearchTerm: string,
): boolean {
  if (normalizedSearchTerm === "") {
    return true
  }

  return (
    String(application.id).includes(normalizedSearchTerm) ||
    application.applicant.email.toLowerCase().includes(normalizedSearchTerm) ||
    application.grant.name.toLowerCase().includes(normalizedSearchTerm)
  )
}

function matchesStatusFilter(
  application: Application,
  statusFilter: StatusFilterValue,
): boolean {
  return statusFilter === "all" || application.status === statusFilter
}

function matchesAwardFilter(
  application: Application,
  awardFilter: AwardFilterValue,
): boolean {
  if (awardFilter === "all") {
    return true
  }

  if (awardFilter === NO_AWARD_FILTER_VALUE) {
    return !hasAward(application)
  }

  return application.award?.name === awardFilter
}

export function filterApplications(
  applications: Application[],
  searchTerm: string,
  statusFilter: StatusFilterValue,
  awardFilter: AwardFilterValue = "all",
): Application[] {
  const normalizedSearchTerm = searchTerm.toLowerCase()

  return applications.filter(
    application =>
      matchesSearchTerm(application, normalizedSearchTerm) &&
      matchesStatusFilter(application, statusFilter) &&
      matchesAwardFilter(application, awardFilter),
  )
}
