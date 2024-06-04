import { create } from 'zustand';

import { PayoutFilterableEra } from '../../data/types';

type State = {
  maxEras: PayoutFilterableEra;
};

type Actions = {
  setMaxEras: (maxEras: State['maxEras']) => void;
};

type Store = State & Actions;

export const usePayoutsFilterByEraStore = create<Store>((set) => ({
  maxEras: PayoutFilterableEra.TWO,
  setMaxEras: (maxEras) => set({ maxEras }),
}));
