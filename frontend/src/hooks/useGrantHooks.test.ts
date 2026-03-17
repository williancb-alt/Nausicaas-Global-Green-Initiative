import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import {
    useGrants,
    useCreateGrant,
    useUpdateGrant,
    useDeleteGrant,
    useGrant,
} from "./useGrantHooks"
import { api } from "../services/api"
import { Grant, GrantPage, BaseResponse } from "../services/api/client"

vi.mock("../services/api", () => ({
    api: {
        grants: {
            listGrants: vi.fn(),
            createGrant: vi.fn(),
            updateGrant: vi.fn(),
            deleteGrant: vi.fn(),
            getGrant: vi.fn(),
        },
    },
}))

vi.mock("../store/grantsStore", () => ({
    useGrantsStore: vi.fn(() => ({ currentPage: 1, itemsPerPage: 10 })),
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useGrants", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should fetch grants list", async () => {
        const mockPage: GrantPage = {
            items: [{ name: "Env Grant", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year" }],
            total_items: 1,
            total_pages: 1,
            page: 1,
            has_next: false,
            has_prev: false,
            items_per_page: 10,
            links: { self: "", first: "", last: "" }
        }
        vi.mocked(api.grants.listGrants).mockResolvedValueOnce(mockPage)

        const { result } = renderHook(() => useGrants(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockPage)
    })

    it("should handle error", async () => {
        vi.mocked(api.grants.listGrants).mockRejectedValueOnce(new Error("API Error"))

        const { result } = renderHook(() => useGrants(), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})

describe("useGrant", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should fetch a single grant by name", async () => {
        const mockGrant: Grant = { name: "Env Grant", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year" }
        vi.mocked(api.grants.getGrant).mockResolvedValueOnce(mockGrant)

        const { result } = renderHook(() => useGrant("Env Grant"), { wrapper: createWrapper() })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockGrant)
    })

    it("should not fetch when name is empty", () => {
        const { result } = renderHook(() => useGrant(""), { wrapper: createWrapper() })
        expect(result.current.fetchStatus).toBe("idle")
        expect(api.grants.getGrant).not.toHaveBeenCalled()
    })
})

describe("useCreateGrant", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should create a grant", async () => {
        const mockResponse: BaseResponse = { status: "success", message: "created" }
        vi.mocked(api.grants.createGrant).mockResolvedValueOnce(mockResponse)

        const { result } = renderHook(() => useCreateGrant(), { wrapper: createWrapper() })
        result.current.mutate({ name: "Test Grant", deadline: "2026-12-31", description: "A grant" })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockResponse)
    })
})

describe("useUpdateGrant", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should update a grant", async () => {
        const mockResponse: BaseResponse = { status: "success", message: "updated" }
        vi.mocked(api.grants.updateGrant).mockResolvedValueOnce(mockResponse)

        const { result } = renderHook(() => useUpdateGrant(), { wrapper: createWrapper() })
        result.current.mutate({ name: "Test Grant", deadline: "2027-01-01" })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
})

describe("useDeleteGrant", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should delete a grant", async () => {
        vi.mocked(api.grants.deleteGrant).mockResolvedValueOnce(undefined)

        const { result } = renderHook(() => useDeleteGrant(), { wrapper: createWrapper() })
        result.current.mutate("Test Grant")

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
})
