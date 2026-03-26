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

const textField: DynamicFieldConfig = {
  type: "text",
  label: "Org Name",
  maxLength: 100,
  required: true,
}

/** Render hook and enter edit mode for baseGrant. */
function renderInEditMode() {
  const { result } = renderHook(() => useGrantManagement())
  act(() => result.current.startEdit(baseGrant))
  return result
}

/** Render hook, enter edit mode, and call saveEdit — returns result + mutation callbacks. */
function renderAndSave() {
  const result = renderInEditMode()
  act(() => result.current.saveEdit())
  const onSuccess = mockMutate.mock.calls[0][1].onSuccess as () => void
  const onError = mockMutate.mock.calls[0][1].onError as (e: Error) => void
  return { result, onSuccess, onError }
}

/** Render hook and toggle visibility on a grant — returns result + mutation callbacks. */
function renderAndToggle(hidden: boolean) {
  const { result } = renderHook(() => useGrantManagement())
  act(() => result.current.toggleVisibility({ ...baseGrant, hidden }))
  const onSuccess = mockMutate.mock.calls[0][1].onSuccess as () => void
  const onError = mockMutate.mock.calls[0][1].onError as (e: Error) => void
  return { result, onSuccess, onError }
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

  describe("create", () => {
    it("should include custom fields in payload", () => {
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

    it("should reset form on success", () => {
      const { result } = renderHook(() => useGrantManagement())

      act(() => {
        result.current.onCreate({
          name: "New Grant",
          deadline: "01/01/27",
          description: "A grant",
        })
      })

      const onSuccess = mockCreateMutate.mock.calls[0][1]
        .onSuccess as () => void
      act(() => onSuccess())

      expect(mockReset).toHaveBeenCalled()
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1)
    })
  })

  describe("edit", () => {
    it("should populate edit state from grant", () => {
      const result = renderInEditMode()

      expect(result.current.editingId).toBe("Env Grant")
      expect(result.current.editFormData).toEqual({
        name: "Env Grant",
        deadline: "12/31/26",
        description: "Desc",
      })
    })

    it("should parse custom_fields object", () => {
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

    it.each([
      { desc: "invalid JSON", custom_fields: "not valid json" as any },
      { desc: "no custom_fields", custom_fields: undefined },
    ])(
      "should default to empty configs/values with $desc",
      ({ custom_fields }) => {
        const { result } = renderHook(() => useGrantManagement())

        act(() =>
          result.current.startEdit({ ...baseGrant, custom_fields } as Grant),
        )

        expect(result.current.editCustomFieldConfigs).toEqual([])
        expect(result.current.editCustomFieldValues).toEqual({})
      },
    )

    it("should update form data on handleEditChange", () => {
      const result = renderInEditMode()
      act(() => result.current.handleEditChange("deadline", "06/30/27"))
      expect(result.current.editFormData.deadline).toBe("06/30/27")
    })
  })

  describe("save", () => {
    it("should send payload with custom fields", () => {
      renderAndSave()

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

    it("should not save when editingId is null", () => {
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.saveEdit())
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it("should clear editingId on success", () => {
      const { result, onSuccess } = renderAndSave()
      act(() => onSuccess())
      expect(result.current.editingId).toBeNull()
    })

    it("should alert on error", () => {
      const { onError } = renderAndSave()
      act(() => onError(new Error("Server error")))
      expect(window.alert).toHaveBeenCalledWith(
        "Failed to save changes: Server error",
      )
    })
  })

  describe("delete", () => {
    it("should delete after confirm", () => {
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.onDelete("Env Grant"))
      expect(window.confirm).toHaveBeenCalled()
      expect(mockDeleteMutate).toHaveBeenCalledWith("Env Grant")
    })

    it("should not delete when confirm is cancelled", () => {
      vi.spyOn(window, "confirm").mockReturnValue(false)
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.onDelete("Env Grant"))
      expect(mockDeleteMutate).not.toHaveBeenCalled()
    })
  })

  describe("toggle visibility", () => {
    it("should call mutate with toggled hidden state", () => {
      const { result } = renderAndToggle(false)

      expect(mockMutate).toHaveBeenCalledWith(
        { name: "Env Grant", hidden: true },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      )
      expect(result.current.togglingGrant).toBe("Env Grant")
    })

    it("should clear togglingGrant on success", () => {
      const { result, onSuccess } = renderAndToggle(false)
      act(() => onSuccess())
      expect(result.current.togglingGrant).toBeNull()
    })

    it("should alert and clear togglingGrant on error", () => {
      const { result, onError } = renderAndToggle(true)
      act(() => onError(new Error("Toggle failed")))
      expect(window.alert).toHaveBeenCalledWith(
        "Failed to toggle visibility: Toggle failed",
      )
      expect(result.current.togglingGrant).toBeNull()
    })
  })

  describe("custom fields", () => {
    it("should add field in create mode", () => {
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.handleFieldAdd(textField))
      expect(result.current.customFieldConfigs).toEqual([textField])
    })

    it("should add field in edit mode", () => {
      const result = renderInEditMode()
      act(() => result.current.handleFieldAdd(textField))
      expect(result.current.editCustomFieldConfigs).toEqual([textField])
    })

    it("should remove field and value in create mode", () => {
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.handleFieldAdd(textField))
      act(() => result.current.setFieldValue("Org Name", "Acme"))
      act(() => result.current.handleRemoveField(0))
      expect(result.current.customFieldConfigs).toEqual([])
      expect(result.current.customFieldValues).toEqual({})
    })

    it("should remove field and value in edit mode", () => {
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

    it("should set value in create mode", () => {
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.setFieldValue("Budget", "$5000"))
      expect(result.current.customFieldValues).toEqual({ Budget: "$5000" })
    })

    it("should set value in edit mode", () => {
      const { result } = renderHook(() => useGrantManagement())
      act(() => result.current.setFieldValue("Budget", "$5000", true))
      expect(result.current.editCustomFieldValues).toEqual({ Budget: "$5000" })
    })
  })

  it("should manage isFieldModalOpen state", () => {
    const { result } = renderHook(() => useGrantManagement())
    expect(result.current.isFieldModalOpen).toBe(false)
    act(() => result.current.setIsFieldModalOpen(true))
    expect(result.current.isFieldModalOpen).toBe(true)
  })
})
