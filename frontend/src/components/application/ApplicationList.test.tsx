import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { ApplicationList } from "./ApplicationList"
import { Application } from "../../types"

const mockApplications = [
  {
    id: 1,
    status: "approved",
    submitted_date: "2026-01-01",
    grant: { name: "Grant 1", description: "Desc 1" },
    feedback: "Good",
  },
  {
    id: 2,
    status: "pending_review",
    submitted_date: "2026-01-02",
    grant: { name: "Grant 2" },
  },
] as Application[]

describe("ApplicationList", () => {
  const onViewDetailsMock = vi.fn()

  it("should show loading state", () => {
    render(
      <MemoryRouter>
        <ApplicationList
          isLoading={true}
          isError={false}
          applications={[]}
          onViewDetails={onViewDetailsMock}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText("Loading your applications...")).toBeDefined()
  })

  it("should show error state", () => {
    render(
      <MemoryRouter>
        <ApplicationList
          isLoading={false}
          isError={true}
          applications={[]}
          onViewDetails={onViewDetailsMock}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Unable to load your applications/)).toBeDefined()
  })

  it("should show empty state", () => {
    render(
      <MemoryRouter>
        <ApplicationList
          isLoading={false}
          isError={false}
          applications={[]}
          onViewDetails={onViewDetailsMock}
        />
      </MemoryRouter>,
    )
    expect(
      screen.getByText(/You have not applied to any grants yet/),
    ).toBeDefined()
  })

  it("should render list of applications", () => {
    render(
      <MemoryRouter>
        <ApplicationList
          isLoading={false}
          isError={false}
          applications={mockApplications}
          onViewDetails={onViewDetailsMock}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText("Grant 1")).toBeDefined()
    expect(screen.getByText("Grant 2")).toBeDefined()
    expect(screen.getByText("Approved")).toBeDefined()
    expect(screen.getByText("Pending Review")).toBeDefined()
    expect(screen.getByText("Good")).toBeDefined()
  })

  it("should call onViewDetails when View Details button is clicked", () => {
    render(
      <MemoryRouter>
        <ApplicationList
          isLoading={false}
          isError={false}
          applications={mockApplications}
          onViewDetails={onViewDetailsMock}
        />
      </MemoryRouter>,
    )

    const viewButtons = screen.getAllByText("View Details")
    fireEvent.click(viewButtons[0])

    expect(onViewDetailsMock).toHaveBeenCalledWith(1)
  })
})
