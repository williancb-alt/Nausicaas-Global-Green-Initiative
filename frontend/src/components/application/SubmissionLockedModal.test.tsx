import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SubmissionLockedModal } from "./SubmissionLockedModal"

describe("SubmissionLockedModal", () => {
  const onCloseMock = vi.fn()

  const renderModal = (props = {}) =>
    render(
      <SubmissionLockedModal
        isOpen={true}
        onClose={onCloseMock}
        status="approved"
        submittedDate="2026-03-16"
        {...props}
      />,
    )

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = "unset"
  })

  it("should not render when isOpen is false", () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.firstChild).toBeNull()
  })

  it("should render correctly when open", () => {
    renderModal()
    expect(screen.getByText("Submission Locked")).toBeDefined()
    expect(screen.getByText("Approved")).toBeDefined()
    expect(screen.getByText("2026-03-16")).toBeDefined()
    expect(screen.getByText("Got it")).toBeDefined()
  })

  it("should call onClose when clicking the backdrop", () => {
    const { container } = renderModal()

    const backdrop = container.querySelector(".modal-backdrop")
    if (backdrop) fireEvent.click(backdrop)

    expect(onCloseMock).toHaveBeenCalled()
  })

  it("should call onClose when clicking the X button in header", () => {
    renderModal()
    const closeBtn = screen.getByLabelText("Close")
    fireEvent.click(closeBtn)
    expect(onCloseMock).toHaveBeenCalled()
  })

  it("should call onClose when clicking the 'Got it' button", () => {
    renderModal()
    fireEvent.click(screen.getByText("Got it"))
    expect(onCloseMock).toHaveBeenCalled()
  })

  it("should call onClose when pressing Escape key", () => {
    renderModal()
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onCloseMock).toHaveBeenCalled()
  })

  it("should set body overflow to hidden when open and reset when closed", () => {
    const { rerender } = render(
      <SubmissionLockedModal
        isOpen={true}
        onClose={onCloseMock}
        status="approved"
        submittedDate="2026-03-16"
      />,
    )

    expect(document.body.style.overflow).toBe("hidden")

    rerender(
      <SubmissionLockedModal
        isOpen={false}
        onClose={onCloseMock}
        status="approved"
        submittedDate="2026-03-16"
      />,
    )

    expect(document.body.style.overflow).toBe("unset")
  })
})
