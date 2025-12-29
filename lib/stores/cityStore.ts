import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CityState {
  selectedCityId: string | null;
  hasSelectedCity: boolean;
  setSelectedCity: (cityId: string) => void;
  clearSelectedCity: () => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCityId: null,
      hasSelectedCity: false,
      setSelectedCity: (cityId: string) => {
        set({ selectedCityId: cityId, hasSelectedCity: true });
      },
      clearSelectedCity: () => {
        set({ selectedCityId: null, hasSelectedCity: false });
      },
    }),
    {
      name: 'city-storage',
      partialize: (state) => ({
        selectedCityId: state.selectedCityId,
        hasSelectedCity: state.hasSelectedCity,
      }),
    }
  )
);

