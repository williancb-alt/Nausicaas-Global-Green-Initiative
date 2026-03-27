import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SupportFilterBar } from "./SupportFilterBar"

// Default props defined for use across the tests
const defaultProps = {
  searchQuery: "",
  setSearchQuery: vi.fn(),
  statusFilter: "all" as const,
  setStatusFilter: vi.fn(),
  stats: { total: 10, pending: 4, replied: 6 },
}

describe("SupportFilterBar", () => {
  it("search input and filter buttons rendered with stats", () => {
    // Render the component with default props
    render(<SupportFilterBar {...defaultProps} />)

    // Validate that the search input and filter buttons with stats are rendered as expected
    expect(
      screen.getByPlaceholderText("Search by subject or user email..."),
    ).toBeDefined()
    expect(screen.getByText("All (10)")).toBeDefined()
    expect(screen.getByText("Pending (4)")).toBeDefined()
    expect(screen.getByText("Replied (6)")).toBeDefined()
  })

  it("current search query value shown to suer", () => {
    // Render the component with default props and a searchQuery value
    render(<SupportFilterBar {...defaultProps} searchQuery="test query" />)
    // Validate that the search input shows the current search query value passed in as a prop
    expect(screen.getByDisplayValue("test query")).toBeDefined()
  })

  it("setSearchQuery function called on input change", () => {
    // Mock the setSearchQuery function
    const setSearchQuery = vi.fn()

    // Render the component with the mocked setSearchQuery function
    render(
      <SupportFilterBar {...defaultProps} setSearchQuery={setSearchQuery} />,
    )

    // Change the value of the search input and validate that setSearchQuery was called with the expected value
    fireEvent.change(
      screen.getByPlaceholderText("Search by subject or user email..."),
      {
        target: { value: "hello" },
      },
    )
    expect(setSearchQuery).toHaveBeenCalledWith("hello")
  })

  it.each([
    ["All (10)", "all"],
    ["Pending (4)", "pending"],
    ["Replied (6)", "replied"],
  ] as const)(
    "setStatusFilter function called with '%s' when %s is clicked",
    (label, expectedFilter) => {
      // Mock the setStatusFilter function
      const setStatusFilter = vi.fn()

      // Render the component with the mocked setStatusFilter function
      render(
        <SupportFilterBar
          {...defaultProps}
          setStatusFilter={setStatusFilter}
        />,
      )

      // Click the filter button and validate that setStatusFilter was called with the expected filter value
      fireEvent.click(screen.getByText(label))
      expect(setStatusFilter).toHaveBeenCalledWith(expectedFilter)
    },
  )

  it("active style applied to the selected filter button", () => {
    // Render the component with default props and statusFilter set to "pending"
    render(<SupportFilterBar {...defaultProps} statusFilter="pending" />)

    // Validate that the Pending button has the active style while the other buttons do not
    const pendingBtn = screen.getByText("Pending (4)")
    const allBtn = screen.getByText("All (10)")

    expect(pendingBtn.className).toContain("btn-success")
    expect(allBtn.className).toContain("btn-light")
  })
})
