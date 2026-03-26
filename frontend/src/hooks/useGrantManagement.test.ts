import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useGrantManagement } from "./useGrantManagement"
import type { Grant } from "../services/api/client"
import type { DynamicFieldConfig } from "../types"

// --- Mocks ---

const mockMutate = vi.fn()
const mockCreateMutate = vi.fn()
const mockDeleteMutate = vi.fn()
const mockSetCurrentPage = vi.fn()
const mockReset = vi.fn()

const makeMutation = (mutate = mockMutate) => ({
  mutate,
  isPending: false,
  isError: false,
  error: null,
  reset: vi.fn(),
  isSuccess: false,
  status: "idle" as const,
  data: undefined,
})

vi.mock("../hooks/useGrantHooks", () => ({
  useGrants: vi.fn(() => ({
    data: {
      items: [
        {
          name: "Env Grant",
          deadline: "12/31/26",
          description: "Desc",
          deadline_passed: false,
          time_remaining: "1 year",
        },
      ],
    },
    isLoading: false,
  })),
  useCreateGrant: vi.fn(() => makeMutation(mockCreateMutate)),
  useUpdateGrant: vi.fn(() => makeMutation(mockMutate)),
  useDeleteGrant: vi.fn(() => makeMutation(mockDeleteMutate)),
}))

vi.mock("../store/grantsStore", () => ({
  useGrantsStore: vi.fn(() => ({
    currentPage: 1,
    itemsPerPage: 10,
    setCurrentPage: mockSetCurrentPage,
  })),
}))

// Mock react-hook-form to avoid zodResolver complexity
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    reset: mockReset,
  }),
}))

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(),
}))

const baseGrant: Grant = {
  name: "Env Grant",
  deadline: "12/31/26",
  description: "Desc",
  deadline_passed: false,
  time_remaining: "1 year",
}

describe("useGrantManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, "confirm").mockReturnValue(true)
    vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  it("should return grants from query data", () => {
    const { result } = renderHook(() => useGrantManagement())
    expect(result.current.grants).toEqual([
      expect.objectContaining({ name: "Env Grant" }),
    ])
    expect(result.current.isLoading).toBe(false)
  })

  it("should create grant with custom fields payload", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => {
      result.current.onCreate({
        name: "New Grant",
        deadline: "01/01/27",
        description: "A grant",
      })
    })

    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        name: "New Grant",
        deadline: "01/01/27",
        description: "A grant",
        custom_fields: JSON.stringify({ configs: [], values: {} }),
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it("should reset form and custom fields on create success", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => {
      result.current.onCreate({
        name: "New Grant",
        deadline: "01/01/27",
        description: "A grant",
      })
    })

    // Simulate onSuccess callback
    const onSuccess = mockCreateMutate.mock.calls[0][1].onSuccess
    act(() => onSuccess())

    expect(mockReset).toHaveBeenCalled()
    expect(mockSetCurrentPage).toHaveBeenCalledWith(1)
  })

  it("should start editing a grant", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))

    expect(result.current.editingId).toBe("Env Grant")
    expect(result.current.editFormData).toEqual({
      name: "Env Grant",
      deadline: "12/31/26",
      description: "Desc",
    })
  })

  it("should parse custom_fields when starting edit", () => {
    const { result } = renderHook(() => useGrantManagement())

    const configs: DynamicFieldConfig[] = [
      { type: "text", label: "Org", maxLength: 100, required: true },
    ]

    act(() =>
      result.current.startEdit({
        ...baseGrant,
        custom_fields: { configs, values: { Org: "Acme" } },
      }),
    )

    expect(result.current.editCustomFieldConfigs).toEqual(configs)
    expect(result.current.editCustomFieldValues).toEqual({ Org: "Acme" })
  })

  it("should handle invalid custom_fields JSON gracefully", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() =>
      result.current.startEdit({
        ...baseGrant,
        custom_fields: "not valid json" as any,
      }),
    )

    expect(result.current.editCustomFieldConfigs).toEqual([])
    expect(result.current.editCustomFieldValues).toEqual({})
  })

  it("should handle grant with no custom_fields", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))

    expect(result.current.editCustomFieldConfigs).toEqual([])
    expect(result.current.editCustomFieldValues).toEqual({})
  })

  it("should update editFormData on handleEditChange", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))
    act(() => result.current.handleEditChange("deadline", "06/30/27"))

    expect(result.current.editFormData.deadline).toBe("06/30/27")
  })

  it("should save edit with payload including custom fields", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))
    act(() => result.current.saveEdit())

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Env Grant",
        deadline: "12/31/26",
        description: "Desc",
        custom_fields: expect.any(String),
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
  })

  it("should not save edit when editingId is null", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.saveEdit())

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it("should clear editingId on save success", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))
    act(() => result.current.saveEdit())

    const onSuccess = mockMutate.mock.calls[0][1].onSuccess
    act(() => onSuccess())

    expect(result.current.editingId).toBeNull()
  })

  it("should alert on save error", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))
    act(() => result.current.saveEdit())

    const onError = mockMutate.mock.calls[0][1].onError
    act(() => onError(new Error("Server error")))

    expect(window.alert).toHaveBeenCalledWith(
      "Failed to save changes: Server error",
    )
  })

  it("should delete grant after confirm", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.onDelete("Env Grant"))

    expect(window.confirm).toHaveBeenCalled()
    expect(mockDeleteMutate).toHaveBeenCalledWith("Env Grant")
  })

  it("should not delete grant when confirm is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false)

    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.onDelete("Env Grant"))

    expect(mockDeleteMutate).not.toHaveBeenCalled()
  })

  it("should toggle visibility", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.toggleVisibility({ ...baseGrant, hidden: false }))

    expect(mockMutate).toHaveBeenCalledWith(
      { name: "Env Grant", hidden: true },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
    expect(result.current.togglingGrant).toBe("Env Grant")
  })

  it("should clear togglingGrant on toggle success", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.toggleVisibility({ ...baseGrant, hidden: false }))

    const onSuccess = mockMutate.mock.calls[0][1].onSuccess
    act(() => onSuccess())

    expect(result.current.togglingGrant).toBeNull()
  })

  it("should alert and clear togglingGrant on toggle error", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.toggleVisibility({ ...baseGrant, hidden: true }))

    const onError = mockMutate.mock.calls[0][1].onError
    act(() => onError(new Error("Toggle failed")))

    expect(window.alert).toHaveBeenCalledWith(
      "Failed to toggle visibility: Toggle failed",
    )
    expect(result.current.togglingGrant).toBeNull()
  })

  it("should add field config for create mode", () => {
    const { result } = renderHook(() => useGrantManagement())

    const field: DynamicFieldConfig = {
      type: "text",
      label: "Org Name",
      maxLength: 100,
      required: true,
    }

    act(() => result.current.handleFieldAdd(field))

    expect(result.current.customFieldConfigs).toEqual([field])
  })

  it("should add field config for edit mode", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.startEdit(baseGrant))

    const field: DynamicFieldConfig = {
      type: "text",
      label: "Org Name",
      maxLength: 100,
      required: true,
    }

    act(() => result.current.handleFieldAdd(field))

    expect(result.current.editCustomFieldConfigs).toEqual([field])
  })

  it("should remove field config in create mode", () => {
    const { result } = renderHook(() => useGrantManagement())

    const field: DynamicFieldConfig = {
      type: "text",
      label: "Org Name",
      maxLength: 100,
      required: true,
    }

    act(() => result.current.handleFieldAdd(field))
    act(() => result.current.setFieldValue("Org Name", "Acme"))
    act(() => result.current.handleRemoveField(0))

    expect(result.current.customFieldConfigs).toEqual([])
    expect(result.current.customFieldValues).toEqual({})
  })

  it("should remove field config in edit mode", () => {
    const { result } = renderHook(() => useGrantManagement())

    const configs: DynamicFieldConfig[] = [
      { type: "text", label: "Org", maxLength: 100, required: true },
    ]

    act(() =>
      result.current.startEdit({
        ...baseGrant,
        custom_fields: { configs, values: { Org: "Acme" } },
      }),
    )
    act(() => result.current.handleRemoveField(0, true))

    expect(result.current.editCustomFieldConfigs).toEqual([])
    expect(result.current.editCustomFieldValues).toEqual({})
  })

  it("should set field value in create mode", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.setFieldValue("Budget", "$5000"))

    expect(result.current.customFieldValues).toEqual({ Budget: "$5000" })
  })

  it("should set field value in edit mode", () => {
    const { result } = renderHook(() => useGrantManagement())

    act(() => result.current.setFieldValue("Budget", "$5000", true))

    expect(result.current.editCustomFieldValues).toEqual({ Budget: "$5000" })
  })

  it("should manage isFieldModalOpen state", () => {
    const { result } = renderHook(() => useGrantManagement())

    expect(result.current.isFieldModalOpen).toBe(false)

    act(() => result.current.setIsFieldModalOpen(true))

    expect(result.current.isFieldModalOpen).toBe(true)
  })
})
