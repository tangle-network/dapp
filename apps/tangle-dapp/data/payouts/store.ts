import { create } from 'zustand';

import type { Payout } from '../../types';

type State = {
  isLoading: boolean;
  data: Payout[];
};

type Actions = {
  setIsLoading: (isLoading: boolean) => void;
  setPayouts: (data: Payout[]) => void;
};

type Store = State & Actions;

export const usePayoutsStore = create<Store>((set) => ({
  isLoading: false,
  data: [],
  setIsLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
  setPayouts: (data) => set((state) => ({ ...state, data })),
}));
