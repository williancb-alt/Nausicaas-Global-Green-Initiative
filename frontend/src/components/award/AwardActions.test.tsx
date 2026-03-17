import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AwardActions } from "./AwardActions"

interface MockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

vi.mock("../button/Button", () => ({
  Button: ({ children, onClick, disabled }: MockButtonProps) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

describe("AwardActions", () => {
  const defaultProps = {
    isExpanded: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    isDeleting: false,
    onEditClick: vi.fn(),
    onDeleteClick: vi.fn(),
  }

  it("should render edit and delete buttons", () => {
    render(<AwardActions {...defaultProps} />)
    expect(screen.getByText("Edit")).toBeDefined()
    expect(screen.getByText("Delete")).toBeDefined()
    expect(screen.getByText("\u25BC")).toBeDefined() // collapsed icon
  })

  it("should show up arrow when expanded", () => {
    render(<AwardActions {...defaultProps} isExpanded={true} />)
    expect(screen.getByText("\u25B2")).toBeDefined()
  })

  it("should call onEditClick", () => {
    render(<AwardActions {...defaultProps} />)
    fireEvent.click(screen.getByText("Edit"))
    expect(defaultProps.onEditClick).toHaveBeenCalled()
  })

  it("should call onDeleteClick", () => {
    render(<AwardActions {...defaultProps} />)
    fireEvent.click(screen.getByText("Delete"))
    expect(defaultProps.onDeleteClick).toHaveBeenCalled()
  })

  it("should show loading state while deleting", () => {
    render(<AwardActions {...defaultProps} isDeleting={true} />)
    expect(screen.getByText("...")).toBeDefined()
    expect(screen.getByRole("button", { name: "..." })).toBeDisabled()
  })

  it("should not render edit button if onEdit is missing", () => {
    render(<AwardActions {...defaultProps} onEdit={undefined} />)
    expect(screen.queryByText("Edit")).toBeNull()
  })

  it("should not render delete button if onDelete is missing", () => {
    render(<AwardActions {...defaultProps} onDelete={undefined} />)
    expect(screen.queryByText("Delete")).toBeNull()
  })
})
