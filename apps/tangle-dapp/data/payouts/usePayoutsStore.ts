import { create } from 'zustand';

import { PayoutsEraRange } from '../types';
import type { Payout } from '../../types';

type State = {
  isLoading: boolean;
  data: {
    [eraRange: number]: Payout[];
  };
  eraRange: PayoutsEraRange;
};

type Actions = {
  setIsLoading: (isLoading: State['isLoading']) => void;
  setPayouts: (data: State['data']) => void;
  resetPayouts: () => void;
  setEraRange: (eraRange: State['eraRange']) => void;
};

type Store = State & Actions;

export const usePayoutsStore = create<Store>((set) => ({
  isLoading: false,
  data: {},
  eraRange: PayoutsEraRange.TWO,
  setIsLoading: (isLoading) => set({ isLoading }),
  setPayouts: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
  resetPayouts: () => set({ data: {} }),
  setEraRange: (eraRange) => set({ eraRange }),
}));
