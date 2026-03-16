import { render, screen, fireEvent, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AwardManagementPage } from "./AwardManagementPage"
import { useAwards, useCreateAward, useUpdateAward, useDeleteAward } from "../hooks/useAwardHooks"
import { useAwardsStore } from "../store/awardsStore"
import { AWARD_MESSAGES } from "../utils/constants"

// Mock dependencies
vi.mock("../hooks/useAwardHooks")
vi.mock("../store/awardsStore")
vi.mock("lucide-react", () => ({
    Edit2: () => <span data-testid="edit-icon" />,
    Trash2: () => <span data-testid="trash-icon" />,
    Eye: () => <span data-testid="eye-icon" />,
    EyeOff: () => <span data-testid="eye-off-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
}))

const mockAwards = [
    { name: "Award 1", deadline: "12/31/26", description: "Desc 1", hidden: false },
    { name: "Award 2", deadline: "01/01/27", description: "Desc 2", hidden: true },
]

describe("AwardManagementPage", () => {
    const setCurrentPageMock = vi.fn()
    const createAwardMutateMock = vi.fn()
    const updateAwardMutateMock = vi.fn()
    const deleteAwardMutateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAwardsStore).mockReturnValue({ setCurrentPage: setCurrentPageMock } as any)
        vi.mocked(useAwards).mockReturnValue({ data: { items: mockAwards }, isLoading: false } as any)
        vi.mocked(useCreateAward).mockReturnValue({ mutate: createAwardMutateMock, isPending: false } as any)
        vi.mocked(useUpdateAward).mockReturnValue({ mutate: updateAwardMutateMock, isPending: false } as any)
        vi.mocked(useDeleteAward).mockReturnValue({ mutate: deleteAwardMutateMock, isPending: false } as any)
    })

    it("should render the page with awards table", () => {
        render(<AwardManagementPage />)
        expect(screen.getByText("Award Management")).toBeDefined()
        expect(screen.getByText("Award 1")).toBeDefined()
        expect(screen.getByText("Award 2")).toBeDefined()
        expect(screen.getByText("Visible")).toBeDefined()
        expect(screen.getByText("Hidden")).toBeDefined()
    })

    it("should show loading state", () => {
        vi.mocked(useAwards).mockReturnValue({ data: undefined, isLoading: true } as any)
        render(<AwardManagementPage />)
        expect(screen.getByText(AWARD_MESSAGES.loadingAwards)).toBeDefined()
    })

    it("should show empty state when no awards are found", () => {
        vi.mocked(useAwards).mockReturnValue({ data: { items: [] }, isLoading: false } as any)
        render(<AwardManagementPage />)
        expect(screen.getByText(AWARD_MESSAGES.noAwards)).toBeDefined()
    })

    it("should call deleteAward when delete button is clicked and confirmed", () => {
        vi.spyOn(window, "confirm").mockReturnValue(true)
        render(<AwardManagementPage />)

        // Find delete button for Award 1
        const deleteButtons = screen.getAllByTestId("trash-icon")
        fireEvent.click(deleteButtons[0])

        expect(window.confirm).toHaveBeenCalled()
        expect(deleteAwardMutateMock).toHaveBeenCalledWith("Award 1")
    })

    it("should toggle award visibility", () => {
        render(<AwardManagementPage />)

        // Toggle Award 1 (Visible -> Hidden)
        const toggleButtons = screen.getAllByTitle("Hide award")
        fireEvent.click(toggleButtons[0])

        expect(updateAwardMutateMock).toHaveBeenCalledWith(
            { name: "Award 1", hidden: true },
            expect.any(Object)
        )
    })

    it("should show edit card when edit button is clicked", () => {
        render(<AwardManagementPage />)

        const editButtons = screen.getAllByTestId("edit-icon")
        fireEvent.click(editButtons[0])

        expect(screen.getByText("Edit Award: Award 1")).toBeDefined()
        expect(screen.getByDisplayValue("12/31/26")).toBeDefined()
        expect(screen.getByDisplayValue("Desc 1")).toBeDefined()
    })

    it("should update form data in edit card", () => {
        render(<AwardManagementPage />)

        const editButtons = screen.getAllByTestId("edit-icon")
        fireEvent.click(editButtons[0])
        const editCard = screen.getByText(/Edit Award: Award 1/).closest(".card") as HTMLElement
        const deadlineInput = within(editCard).getByPlaceholderText("MM/DD/YY")
        fireEvent.change(deadlineInput, { target: { value: "11/22/33" } })

        expect(deadlineInput).toHaveValue("11/22/33")
    })

    it("should call updateAward when save is clicked in edit card", () => {
        render(<AwardManagementPage />)

        const editButtons = screen.getAllByTestId("edit-icon")
        fireEvent.click(editButtons[0])
        const editCard = screen.getByText(/Edit Award: Award 1/).closest(".card") as HTMLElement

        const saveButton = within(editCard).getByText("Save Changes")
        fireEvent.click(saveButton)

        expect(updateAwardMutateMock).toHaveBeenCalledWith(
            { name: "Award 1", deadline: "12/31/26", description: "Desc 1" },
            expect.any(Object)
        )
    })

    it("should close edit card when cancel is clicked", () => {
        render(<AwardManagementPage />)

        const editButtons = screen.getAllByTestId("edit-icon")
        fireEvent.click(editButtons[0])

        const cancelButton = screen.getByText("Cancel")
        fireEvent.click(cancelButton)

        expect(screen.queryByText("Edit Award: Award 1")).toBeNull()
    })
})
