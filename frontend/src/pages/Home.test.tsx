import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Home } from "./Home"
import { useAuthStore } from "../store/authStore"
import { useGrantsStore } from "../store/grantsStore"
import { useGrants, useCreateGrant, useDeleteGrant } from "../hooks/useGrantHooks"
import { useQueryClient } from "@tanstack/react-query"

// Mock everything the component depends on
vi.mock("../store/authStore")
vi.mock("../store/grantsStore")
vi.mock("../hooks/useGrantHooks")
vi.mock("@tanstack/react-query", async importOriginal => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>()
    return {
        ...actual,
        useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
    }
})

const defaultGrantsMock = {
    data: undefined,
    isLoading: false,
    refetch: vi.fn(),
}

const defaultMutation = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
}

describe("Home Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as any)
        vi.mocked(useGrantsStore).mockReturnValue({
            currentPage: 1,
            setCurrentPage: vi.fn(),
        } as any)
        vi.mocked(useGrants).mockReturnValue(defaultGrantsMock as any)
        vi.mocked(useCreateGrant).mockReturnValue(defaultMutation as any)
        vi.mocked(useDeleteGrant).mockReturnValue(defaultMutation as any)
        vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries: vi.fn() } as any)
    })

    it("should render the Create Grant form", () => {
        render(<Home />)
        // Both the heading and the button say "Create Grant" - assert the heading h2 exists
        expect(screen.getAllByText(/Create Grant/i).length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText("Grant Name")).toBeDefined()
    })

    it("should render the List Grants section", () => {
        render(<Home />)
        expect(screen.getByText("List Grants")).toBeDefined()
    })

    it("should show loading state for grants", () => {
        vi.mocked(useGrants).mockReturnValue({ ...defaultGrantsMock, isLoading: true } as any)
        render(<Home />)
        expect(screen.getByText(/Loading grants/i)).toBeDefined()
    })

    it("should show empty state when no grants exist", () => {
        vi.mocked(useGrants).mockReturnValue({ ...defaultGrantsMock, data: { items: [] } } as any)
        render(<Home />)
        expect(screen.getByText(/no grants/i)).toBeDefined()
    })

    it("should list grants when data is available", () => {
        vi.mocked(useGrants).mockReturnValue({
            ...defaultGrantsMock,
            data: {
                items: [{ name: "Env Grant", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year" }],
                total_pages: 1,
                total_items: 1,
            },
        } as any)
        render(<Home />)
        expect(screen.getByText("Env Grant")).toBeDefined()
    })

    it("should render Add Field button", () => {
        render(<Home />)
        expect(screen.getByText("+ Add Field")).toBeDefined()
    })

    it("should show create grant button", () => {
        render(<Home />)
        // Use the submit button role specifically
        expect(screen.getByRole("button", { name: /Create Grant/i })).toBeDefined()
    })

    it("should show pending state on create button", () => {
        vi.mocked(useCreateGrant).mockReturnValue({ ...defaultMutation, isPending: true } as any)
        render(<Home />)
        expect(screen.getByText(/Creating.../i)).toBeDefined()
    })
})
