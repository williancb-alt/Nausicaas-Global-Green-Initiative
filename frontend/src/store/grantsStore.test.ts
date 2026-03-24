import { describe, it, expect, beforeEach } from "vitest"
import { useGrantsStore } from "./grantsStore"

describe("useGrantsStore", () => {
  beforeEach(() => {
    useGrantsStore.getState().reset()
  })

  it("should have correct initial state", () => {
    const state = useGrantsStore.getState()
    expect(state.currentPage).toBe(1)
    expect(state.itemsPerPage).toBe(10)
  })

  it("should update currentPage", () => {
    useGrantsStore.getState().setCurrentPage(4)
    expect(useGrantsStore.getState().currentPage).toBe(4)
  })

  it("should update itemsPerPage", () => {
    useGrantsStore.getState().setItemsPerPage(20)
    expect(useGrantsStore.getState().itemsPerPage).toBe(20)
  })

  it("should reset to defaults", () => {
    useGrantsStore.getState().setCurrentPage(7)
    useGrantsStore.getState().setItemsPerPage(50)
    useGrantsStore.getState().reset()

    const state = useGrantsStore.getState()
    expect(state.currentPage).toBe(1)
    expect(state.itemsPerPage).toBe(10)
  })
})
