import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Applications } from "./Applications"
import { useApplications } from "../hooks/useApplicationHooks"
import * as router from "react-router-dom"
import { EMPTY_PAGINATED_RESPONSE } from "../test/mock-data"

// Mock dependencies
vi.mock("../hooks/useApplicationHooks")
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...(actual as object),
    useNavigate: vi.fn(),
  }
})

vi.mock("../components/table/ApplicationsListTable", () => ({
  ApplicationsListTable: ({
    applications,
    onViewApplication,
  }: {
    applications: { id: number }[]
    onViewApplication: (id: number) => void
  }) => (
    <div data-testid="apps-table">
      Table with {applications.length} apps
      <button onClick={() => onViewApplication(1)}>View App 1</button>
    </div>
  ),
}))

describe("Applications Page (Admin)", () => {
  const navigateMock = vi.fn()

  const mockUseApplications = (overrides: Record<string, unknown> = {}) => {
    vi.mocked(useApplications).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      ...overrides,
    } as any)
  }

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Applications />
      </MemoryRouter>,
    )

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
  })

  it.each([
    {
      desc: "show loading state",
      overrides: { isLoading: true },
      expectedText: "Loading applications...",
    },
    {
      desc: "show error state",
      overrides: { isError: true },
      expectedText: "Failed to load applications",
    },
    {
      desc: "show empty state",
      overrides: { data: EMPTY_PAGINATED_RESPONSE },
      expectedText: "No applications submitted yet.",
    },
  ])("should $desc", ({ overrides, expectedText }) => {
    mockUseApplications(overrides)
    renderComponent()
    expect(screen.getByText(expectedText)).toBeDefined()
  })

  it("should render table with applications", () => {
    mockUseApplications({
      data: {
        ...EMPTY_PAGINATED_RESPONSE,
        items: [{ id: 1 }, { id: 2 }],
        total_items: 2,
        total_pages: 1,
      },
    })
    renderComponent()
    expect(screen.getByTestId("apps-table")).toBeDefined()
    expect(screen.getByText("Table with 2 apps")).toBeDefined()
    expect(screen.getByText("2 total")).toBeDefined()
  })

  it("should navigate to details on view application", () => {
    mockUseApplications({
      data: {
        ...EMPTY_PAGINATED_RESPONSE,
        items: [{ id: 1 }],
        total_items: 1,
        total_pages: 1,
      },
    })
    renderComponent()
    fireEvent.click(screen.getByText("View App 1"))
    expect(navigateMock).toHaveBeenCalledWith("/admin/applications/1")
  })
})
