import { renderHook } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useAdminStats } from "./useAdminStatsHooks"
import type { Application } from "../types"

const makeApp = (status: string, grantName: string): Application => ({
  id: Math.random(),
  status: status as Application["status"],
  submitted_at: new Date().toISOString(),
  submitted_date: "2026-03-17",
  applicant: { email: "user@test.com", public_id: "user-1" },
  grant: { name: grantName, description: "Test Grant" },
})

describe("useAdminStats", () => {
  it("should return zeros for empty list", () => {
    const { result } = renderHook(() => useAdminStats([]))

    expect(result.current.stats.total).toBe(0)
    expect(result.current.stats.approved).toBe(0)
    expect(result.current.stats.rejected).toBe(0)
    expect(result.current.stats.pending).toBe(0)
  })

  it("should correctly count approved applications", () => {
    const apps = [
      makeApp("approved", "Grant A"),
      makeApp("approved", "Grant B"),
    ]
    const { result } = renderHook(() => useAdminStats(apps))

    expect(result.current.stats.total).toBe(2)
    expect(result.current.stats.approved).toBe(2)
  })

  it("should correctly count denied applications", () => {
    const apps = [makeApp("denied", "Grant A"), makeApp("approved", "Grant A")]
    const { result } = renderHook(() => useAdminStats(apps))

    expect(result.current.stats.rejected).toBe(1)
    expect(result.current.stats.approved).toBe(1)
  })

  it("should count both pending_review and in_review as pending", () => {
    const apps = [
      makeApp("pending_review", "Grant A"),
      makeApp("in_review", "Grant B"),
    ]
    const { result } = renderHook(() => useAdminStats(apps))

    expect(result.current.stats.pending).toBe(2)
  })

  it("should return correct statusChartData shape", () => {
    const apps = [makeApp("approved", "Grant A")]
    const { result } = renderHook(() => useAdminStats(apps))

    const chart = result.current.statusChartData
    expect(chart).toHaveLength(3)
    expect(chart[0].name).toBe("Approved")
    expect(chart[0].value).toBe(1)
    expect(chart[1].name).toBe("Rejected")
    expect(chart[2].name).toBe("Pending Review")
  })

  it("should group applications per grant in grantWiseData", () => {
    const apps = [
      makeApp("approved", "Grant A"),
      makeApp("denied", "Grant A"),
      makeApp("approved", "Grant B"),
    ]
    const { result } = renderHook(() => useAdminStats(apps))

    const grantData = result.current.grantWiseData
    const grantA = grantData.find(g => g.name === "Grant A")
    const grantB = grantData.find(g => g.name === "Grant B")

    expect(grantA?.applications).toBe(2)
    expect(grantB?.applications).toBe(1)
  })
})
