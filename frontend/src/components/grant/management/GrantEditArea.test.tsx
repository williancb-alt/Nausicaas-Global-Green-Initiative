import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { GrantEditArea } from "./GrantEditArea"

// Mock child components to isolate tests to GrantEditArea
vi.mock("./EditGrantFields", () => ({
  EditGrantFields: () => (
    <div data-testid="edit-grant-fields">EditGrantFields</div>
  ),
}))

vi.mock("./CustomFieldManagement", () => ({
  CustomFieldManagement: ({ onOpenModal }: { onOpenModal: () => void }) => (
    <div data-testid="custom-field-management">
      <button onClick={onOpenModal}>Add Field</button>
    </div>
  ),
}))

// Define default props for the component for consistent use across
// tests
const defaultProps = {
  editingId: "green-energy-grant",
  editFormData: {
    name: "Green Energy Grant",
    deadline: "12/31/25",
    description: "Desc",
  },
  handleEditChange: vi.fn(),
  isPending: false,
  onSave: vi.fn(),
  onCancel: vi.fn(),
  customFieldConfigs: [],
  customFieldValues: {},
  setFieldValue: vi.fn(),
  handleRemoveField: vi.fn(),
  setIsFieldModalOpen: vi.fn(),
}

describe("GrantEditArea", () => {
  it("card header rendered with id shown in header", () => {
    // Render the component with default props
    render(<GrantEditArea {...defaultProps} />)

    // Validate that the card header is rendered and that it includes the expected text
    // Note the green-energy-grant id is derived from the editingId prop defined at the top of this file
    expect(screen.getByText("Edit Grant: green-energy-grant")).toBeDefined()
  })

  it("child components that are passed as props are rendered", () => {
    // Render the component with default props
    render(<GrantEditArea {...defaultProps} />)

    // Validate that the EditGrantFields and CustomFieldManagement components are rendered within GrantEditArea
    // Note these have been mocked at top of this file
    // to simplify the implementation and focus on this component
    expect(screen.getByTestId("edit-grant-fields")).toBeDefined()
    expect(screen.getByTestId("custom-field-management")).toBeDefined()
  })

  it("Save and Cancel buttons rendered", () => {
    // Render the component with default props
    render(<GrantEditArea {...defaultProps} />)

    // Validate that the Save Changes and Cancel buttons are rendered
    expect(screen.getByText("Save Changes")).toBeDefined()
    expect(screen.getByText("Cancel")).toBeDefined()
  })

  it("onSave funciton called when Save button is clicked", () => {
    // Mock the onSave function
    const onSave = vi.fn()

    // Render the component with the mocked onSave function
    render(<GrantEditArea {...defaultProps} onSave={onSave} />)

    // Click the Save Changes button and validate that the onSave function was called
    fireEvent.click(screen.getByText("Save Changes"))
    expect(onSave).toHaveBeenCalled()
  })

  it("onCancel function called when Cancel button is clicked", () => {
    // Mock the onCancel function
    const onCancel = vi.fn()

    // Render the component with the mocked onCancel function
    render(<GrantEditArea {...defaultProps} onCancel={onCancel} />)

    // Click the Cancel button and validate that the onCancel function was called
    fireEvent.click(screen.getByText("Cancel"))
    expect(onCancel).toHaveBeenCalled()
  })

  it("Buttons disabled and expected label shown when isPending prop set to true", () => {
    // Render the component with isPending set to true
    render(<GrantEditArea {...defaultProps} isPending={true} />)

    // Validate that the Save Changes button is disabled and that the label "Saving..." is shown when isPending is true
    expect(screen.getByText("Saving...")).toBeDefined()
    expect(screen.getByText("Saving...")).toHaveProperty("disabled", true)
    expect(screen.getByText("Cancel")).toHaveProperty("disabled", true)
  })

  it("setIsFieldModalOpen function called when custom field modal is triggered", () => {
    // Mock the setIsFieldModalOpen function
    const setIsFieldModalOpen = vi.fn()

    // Render the component with the mocked setIsFieldModalOpen function
    render(
      <GrantEditArea
        {...defaultProps}
        setIsFieldModalOpen={setIsFieldModalOpen}
      />,
    )
    // Click the Add Field button in the CustomFieldManagement component to trigger the custom field modal
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that the setIsFieldModalOpen function was called to open the modal
    expect(setIsFieldModalOpen).toHaveBeenCalledWith(true)
  })
})
