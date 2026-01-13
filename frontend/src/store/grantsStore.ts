import { create } from "zustand"

interface GrantsState {
  currentPage: number
  itemsPerPage: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (perPage: number) => void
  reset: () => void
}

const DEFAULT_PAGE = 1
const DEFAULT_ITEMS_PER_PAGE = 10

export const useGrantsStore = create<GrantsState>(set => ({
  currentPage: DEFAULT_PAGE,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  setCurrentPage: page => set({ currentPage: page }),
  setItemsPerPage: perPage => set({ itemsPerPage: perPage }),
  reset: () =>
    set({
      currentPage: DEFAULT_PAGE,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    }),
}))
