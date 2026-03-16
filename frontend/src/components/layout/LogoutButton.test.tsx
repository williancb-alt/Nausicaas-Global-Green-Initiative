import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { LogoutButton } from "./LogoutButton"
import { useLogout } from "../../hooks/useAuthHooks"
import * as router from "react-router-dom"

// Mock dependencies
vi.mock("../../hooks/useAuthHooks")
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual as any,
        useNavigate: vi.fn(),
    }
})

describe("LogoutButton", () => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
    })

    it("should render logout button", () => {
        vi.mocked(useLogout).mockReturnValue({ mutate: vi.fn(), isPending: false } as any)
        render(<LogoutButton />)
        expect(screen.getByText("Logout")).toBeDefined()
    })

    it("should show logging out state", () => {
        vi.mocked(useLogout).mockReturnValue({ mutate: vi.fn(), isPending: true } as any)
        render(<LogoutButton />)
        expect(screen.getByText("Logging out...")).toBeDefined()
        expect(screen.getByRole("button")).toBeDisabled()
    })

    it("should call logout mutation on click", () => {
        const mutateMock = vi.fn()
        vi.mocked(useLogout).mockReturnValue({ mutate: mutateMock, isPending: false } as any)

        render(<LogoutButton />)
        fireEvent.click(screen.getByText("Logout"))

        expect(mutateMock).toHaveBeenCalled()
    })

    it("should navigate to home on success", () => {
        const mutateMock = vi.fn((_, options) => options.onSuccess())
        vi.mocked(useLogout).mockReturnValue({ mutate: mutateMock, isPending: false } as any)

        render(<LogoutButton />)
        fireEvent.click(screen.getByText("Logout"))

        expect(navigateMock).toHaveBeenCalledWith("/")
    })
})
