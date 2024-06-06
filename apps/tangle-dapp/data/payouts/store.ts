import { create } from 'zustand';

import { PayoutFilterableEra } from '../../data/types';
import type { Payout } from '../../types';

type State = {
  isLoading: boolean;
  data: {
    [maxEras: number]: Payout[];
  };
  maxEras: PayoutFilterableEra;
};

type Actions = {
  setIsLoading: (isLoading: State['isLoading']) => void;
  setPayouts: (data: State['data']) => void;
  setMaxEras: (maxEras: State['maxEras']) => void;
};

type Store = State & Actions;

export const usePayoutsStore = create<Store>((set) => ({
  isLoading: false,
  data: {},
  maxEras: PayoutFilterableEra.TWO,
  setIsLoading: (isLoading) => set({ isLoading }),
  setPayouts: (data) => set({ data }),
  setMaxEras: (maxEras) => set({ maxEras }),
}));
