/* eslint-disable react-refresh/only-export-components */
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { render } from "@testing-library/react"

import { vi } from "vitest"

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper })
}

export const mockMutationSuccess = (data?: unknown) => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  reset: vi.fn(),
  isSuccess: true,
  status: "success",
  data,
})

export const mockMutationLoading = () => ({
  mutate: vi.fn(),
  isPending: true,
  isError: false,
  error: null,
  reset: vi.fn(),
  isSuccess: false,
  status: "pending",
  data: undefined,
})

export const mockMutationError = (error: Error) => ({
  mutate: vi.fn(),
  isPending: false,
  isError: true,
  error,
  reset: vi.fn(),
  isSuccess: false,
  status: "error",
  data: undefined,
})
