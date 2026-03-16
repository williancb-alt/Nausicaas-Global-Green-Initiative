import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { UserApplicationNotFoundView } from "./UserApplicationNotFoundView"

describe("UserApplicationNotFoundView", () => {
    it("should render error message and back button", () => {
        const onBackMock = vi.fn()
        render(<UserApplicationNotFoundView onBack={onBackMock} />)

        expect(screen.getByText("Application not found")).toBeDefined()
        const backBtn = screen.getByText("Back to My Applications")
        expect(backBtn).toBeDefined()

        fireEvent.click(backBtn)
        expect(onBackMock).toHaveBeenCalled()
    })
})
