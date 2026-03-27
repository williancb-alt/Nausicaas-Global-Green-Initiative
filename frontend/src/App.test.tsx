import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import App from "./App"

// Mocking a lot of dependencies here, just want to validate that the
// App component renders the header, error handler, and routes as expected
vi.mock("./hooks/useAuthHooks", () => ({
  useUser: vi.fn(),
}))

vi.mock("./features/oauth/OAuthErrorHandler", () => ({
  OAuthErrorHandler: () => <div data-testid="oauth-error-handler" />,
}))

vi.mock("./components/header/Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

vi.mock("./routes", () => ({
  routes: [
    {
      path: "/",
      element: <div data-testid="landing-page">Landing</div>,
    },
    {
      path: "/login",
      element: <div data-testid="login-page">Login</div>,
    },
  ],
}))

describe("App", () => {
  it("header renders", () => {
    render(<App />)
    expect(screen.getByTestId("header")).toBeDefined()
  })

  it("OAuthErrorHandler renders", () => {
    render(<App />)
    expect(screen.getByTestId("oauth-error-handler")).toBeDefined()
  })

  it("landing page renders at the default route", () => {
    render(<App />)
    expect(screen.getByTestId("landing-page")).toBeDefined()
  })

  it("content wrapped in a main element", () => {
    render(<App />)
    const main = document.querySelector("main")
    expect(main).not.toBeNull()
    expect(main?.classList.contains("min-vh-100")).toBe(true)
  })

  it("routes rendered from the routes config", () => {
    render(<App />)
    // The landing route is rendered by default at "/"
    // Note these were mocked at top of this file
    expect(screen.getByText("Landing")).toBeDefined()
  })
})
