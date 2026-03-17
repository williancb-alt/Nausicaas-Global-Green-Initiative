import { describe, it, expect, beforeEach } from "vitest"
import { useAwardsStore } from "./awardsStore"

describe("useAwardsStore", () => {
  beforeEach(() => {
    useAwardsStore.getState().reset()
  })

  it("should have correct initial state", () => {
    const state = useAwardsStore.getState()
    expect(state.currentPage).toBe(1)
    expect(state.itemsPerPage).toBe(10)
  })

  it("should update currentPage", () => {
    useAwardsStore.getState().setCurrentPage(3)
    expect(useAwardsStore.getState().currentPage).toBe(3)
  })

  it("should update itemsPerPage", () => {
    useAwardsStore.getState().setItemsPerPage(25)
    expect(useAwardsStore.getState().itemsPerPage).toBe(25)
  })

  it("should reset to defaults", () => {
    useAwardsStore.getState().setCurrentPage(5)
    useAwardsStore.getState().setItemsPerPage(50)
    useAwardsStore.getState().reset()

    const state = useAwardsStore.getState()
    expect(state.currentPage).toBe(1)
    expect(state.itemsPerPage).toBe(10)
  })
})
