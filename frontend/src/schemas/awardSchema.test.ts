import { describe, it, expect } from "vitest"
import { createAwardSchema } from "./awardSchema"

describe("createAwardSchema", () => {
  const valid = {
    name: "Green Award",
    deadline: "2026-12-31",
    description: "A description for the award",
  }

  it("should pass with valid data", () => {
    expect(createAwardSchema.safeParse(valid).success).toBe(true)
  })

  it("should fail with empty name", () => {
    expect(createAwardSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    )
  })

  it("should fail with special characters in name", () => {
    const result = createAwardSchema.safeParse({ ...valid, name: "Award<>!" })
    expect(result.success).toBe(false)
  })

  it("should fail with empty deadline", () => {
    expect(
      createAwardSchema.safeParse({ ...valid, deadline: "" }).success,
    ).toBe(false)
  })

  it("should fail with empty description", () => {
    expect(
      createAwardSchema.safeParse({ ...valid, description: "" }).success,
    ).toBe(false)
  })

  it("should fail with description over 1000 characters", () => {
    const longDesc = "a".repeat(1001)
    expect(
      createAwardSchema.safeParse({ ...valid, description: longDesc }).success,
    ).toBe(false)
  })
})
