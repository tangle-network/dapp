import { create } from 'zustand';

import type { Payout } from '../../types';

type State = {
  isLoading: boolean;
  data: {
    [maxEras: number]: Payout[];
  };
};

type Actions = {
  setIsLoading: (isLoading: State['isLoading']) => void;
  setPayouts: (data: State['data']) => void;
};

type Store = State & Actions;

export const usePayoutsStore = create<Store>((set) => ({
  isLoading: false,
  data: {},
  setIsLoading: (isLoading) => set({ isLoading }),
  setPayouts: (data) => set({ data }),
}));
