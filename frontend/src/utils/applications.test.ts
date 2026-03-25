import { describe, it, expect } from "vitest"
import { NO_AWARD_FILTER_VALUE, filterApplications } from "./applications"
import type { Application } from "../types"

const makeApp = (
  status: string,
  email: string,
  grantName = "Grant",
  award?: Application["award"],
): Application =>
  ({
    id: 1,
    status,
    applicant: { email },
    grant: { name: grantName },
    award,
  }) as unknown as Application

describe("filterApplications", () => {
  const apps = [
    makeApp("approved", "alice@example.com", "Environment Grant"),
    makeApp("denied", "bob@example.com", "Green Future"),
    makeApp("pending_review", "carol@example.com", "Environment Grant"),
  ]

  it("should return all applications when no filter is set", () => {
    const result = filterApplications(apps, "", "all")
    expect(result).toHaveLength(3)
  })

  it("should filter by status", () => {
    const result = filterApplications(apps, "", "approved")
    expect(result).toHaveLength(1)
    expect(result[0].applicant.email).toBe("alice@example.com")
  })

  it("should filter by search term (email)", () => {
    const result = filterApplications(apps, "bob", "all")
    expect(result).toHaveLength(1)
    expect(result[0].applicant.email).toBe("bob@example.com")
  })

  it("should filter by search term (grant name)", () => {
    const result = filterApplications(apps, "Green Future", "all")
    expect(result).toHaveLength(1)
    expect(result[0].applicant.email).toBe("bob@example.com")
  })

  it("should combine status and search term filters", () => {
    const result = filterApplications(apps, "Environment", "approved")
    expect(result).toHaveLength(1)
    expect(result[0].applicant.email).toBe("alice@example.com")
  })

  it("should be case insensitive", () => {
    const result = filterApplications(apps, "ALICE", "all")
    expect(result).toHaveLength(1)
  })

  it("should return empty array when no match", () => {
    const result = filterApplications(apps, "xyz-no-match", "all")
    expect(result).toHaveLength(0)
  })

  it("should filter applications with no award", () => {
    const awardApps = [
      makeApp("approved", "alice@example.com", "Environment Grant", {
        name: "Impact Award",
      }),
      makeApp("denied", "bob@example.com", "Green Future"),
      makeApp(
        "pending_review",
        "carol@example.com",
        "Environment Grant",
        {} as Application["award"],
      ),
    ]

    const result = filterApplications(
      awardApps,
      "",
      "all",
      NO_AWARD_FILTER_VALUE,
    )

    expect(result).toHaveLength(2)
    expect(result.map(application => application.applicant.email)).toEqual([
      "bob@example.com",
      "carol@example.com",
    ])
  })
})
