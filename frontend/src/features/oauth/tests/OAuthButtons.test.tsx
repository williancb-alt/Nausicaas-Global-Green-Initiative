import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { OAuthButtons } from "../OAuthButtons"

describe("OAuthButtons", () => {
  let locationHref: string

  beforeEach(() => {
    locationHref = ""
    Object.defineProperty(window, "location", {
      value: {
        get href() {
          return locationHref
        },
        set href(value: string) {
          locationHref = value
        },
        assign: vi.fn(),
        replace: vi.fn(),
      },
      writable: true,
      configurable: true,
    })
  })

  it("renders Sign in with Google and Sign in with GitHub by default", () => {
    render(<OAuthButtons />)
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /sign in with github/i }),
    ).toBeInTheDocument()
  })

  it("renders Sign in labels when variant is signin", () => {
    render(<OAuthButtons variant="signin" />)
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /sign in with github/i }),
    ).toBeInTheDocument()
  })

  it("renders Sign up labels when variant is signup", () => {
    render(<OAuthButtons variant="signup" />)
    expect(
      screen.getByRole("button", { name: /sign up with google/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /sign up with github/i }),
    ).toBeInTheDocument()
  })

  it("navigates to Google OAuth URL when Google button is clicked", () => {
    render(<OAuthButtons />)
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    )
    expect(window.location.href).toMatch(/\/auth\/oauth\/google$/)
  })

  it("navigates to GitHub OAuth URL when GitHub button is clicked", () => {
    render(<OAuthButtons />)
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with github/i }),
    )
    expect(window.location.href).toMatch(/\/auth\/oauth\/github$/)
  })

  it("uses base URL from env when building OAuth href", () => {
    render(<OAuthButtons />)
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    )
    expect(window.location.href).toContain("http://localhost:4000/v1")
    expect(window.location.href).toMatch(/\/api\/v1\/auth\/oauth\/google$/)
  })
})
