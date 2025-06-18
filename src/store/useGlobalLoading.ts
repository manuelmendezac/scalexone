import create from 'zustand';

interface GlobalLoadingState {
  isLoadingGlobal: boolean;
  setLoading: (loading: boolean) => void;
}

export const useGlobalLoading = create<GlobalLoadingState>(set => ({
  isLoadingGlobal: false,
  setLoading: (loading: boolean) => set({ isLoadingGlobal: loading }),
})); 