import { create } from 'zustand';

export interface FilterState {
  categoryId: string | null;
  subcategoryId: string | null;
  cityId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  status: string | null;
  search: string | null;
  setCategoryId: (id: string | null) => void;
  setSubcategoryId: (id: string | null) => void;
  setCityId: (id: string | null) => void;
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  setStatus: (status: string | null) => void;
  setSearch: (search: string | null) => void;
  resetFilters: () => void;
  getFilters: () => Record<string, any>;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  categoryId: null,
  subcategoryId: null,
  cityId: null,
  minPrice: null,
  maxPrice: null,
  status: null,
  search: null,
  setCategoryId: (id) => set({ categoryId: id, subcategoryId: null }),
  setSubcategoryId: (id) => set({ subcategoryId: id }),
  setCityId: (id) => set({ cityId: id }),
  setMinPrice: (price) => set({ minPrice: price }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  resetFilters: () =>
    set({
      categoryId: null,
      subcategoryId: null,
      cityId: null,
      minPrice: null,
      maxPrice: null,
      status: null,
      search: null,
    }),
  getFilters: () => {
    const state = get();
    const filters: Record<string, any> = {};
    if (state.categoryId) filters.categoryId = state.categoryId;
    if (state.subcategoryId) filters.subcategoryId = state.subcategoryId;
    if (state.cityId) filters.cityId = state.cityId;
    if (state.minPrice !== null) filters.minPrice = state.minPrice;
    if (state.maxPrice !== null) filters.maxPrice = state.maxPrice;
    if (state.status) filters.status = state.status;
    if (state.search) filters.search = state.search;
    return filters;
  },
}));

