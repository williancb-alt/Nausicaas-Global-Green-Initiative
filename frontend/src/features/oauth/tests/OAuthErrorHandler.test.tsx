import { render, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { OAuthErrorHandler } from "../OAuthErrorHandler"

const mockSetSearchParams = vi.fn()

vi.mock("react-router-dom", () => ({
  useSearchParams: vi.fn(),
}))

import { useSearchParams } from "react-router-dom"

describe("OAuthErrorHandler", () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ])
    mockSetSearchParams.mockClear()
    vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  it("does nothing when oauth_error is not in the URL", async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ])
    render(<OAuthErrorHandler />)

    await waitFor(() => {
      expect(mockSetSearchParams).not.toHaveBeenCalled()
      expect(window.alert).not.toHaveBeenCalled()
    })
  })

  it("removes oauth_error from URL and shows alert when oauth_error is present", async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("?oauth_error=login_failed"),
      mockSetSearchParams,
    ])
    render(<OAuthErrorHandler />)

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function), {
        replace: true,
      })
      expect(window.alert).toHaveBeenCalledWith(
        "Login failed. Please try again.",
      )
    })
  })

  it("updater passed to setSearchParams removes oauth_error", async () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("?oauth_error=login_failed&other=1"),
      mockSetSearchParams,
    ])
    render(<OAuthErrorHandler />)

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled()
    })

    const updater = mockSetSearchParams.mock.calls[0][0] as (
      prev: URLSearchParams,
    ) => URLSearchParams
    const next = updater(
      new URLSearchParams("?oauth_error=login_failed&other=1"),
    )

    expect(next.get("oauth_error")).toBeNull()
    expect(next.get("other")).toBe("1")
  })
})
