import { describe, it, expect } from "vitest"
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./authSchema"

describe("loginSchema", () => {
  it("should pass with valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anypassword",
    })
    expect(result.success).toBe(true)
  })

  it("should fail with invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad-email",
      password: "pass",
    })
    expect(result.success).toBe(false)
  })

  it("should fail with empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })
})

describe("signupSchema", () => {
  const valid = {
    email: "user@example.com",
    password: "Password1",
    confirmPassword: "Password1",
  }

  it("should pass with valid data", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it("should fail when passwords do not match", () => {
    const result = signupSchema.safeParse({
      ...valid,
      confirmPassword: "wrong",
    })
    expect(result.success).toBe(false)
  })

  it("should fail when password is too short", () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: "Pass1",
      confirmPassword: "Pass1",
    })
    expect(result.success).toBe(false)
  })

  it("should fail when password has no uppercase", () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: "password1",
      confirmPassword: "password1",
    })
    expect(result.success).toBe(false)
  })

  it("should fail when password has no number", () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: "PasswordA",
      confirmPassword: "PasswordA",
    })
    expect(result.success).toBe(false)
  })
})

describe("forgotPasswordSchema", () => {
  it("should pass with valid email", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "user@example.com" }).success,
    ).toBe(true)
  })

  it("should fail with invalid email", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "not-an-email" }).success,
    ).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  it("should pass with matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1",
      confirmPassword: "NewPass1",
    })
    expect(result.success).toBe(true)
  })

  it("should fail when passwords do not match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1",
      confirmPassword: "Different1",
    })
    expect(result.success).toBe(false)
  })
})
