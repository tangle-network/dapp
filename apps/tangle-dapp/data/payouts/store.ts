import type { Prettify } from 'viem/chains';
import { create } from 'zustand';

import type { Payout } from '../../types';

type State = {
  isLoading: boolean;
  data: Payout[];
};

type Actions = {
  setIsLoading: (isLoading: State['isLoading']) => void;
  setPayouts: (data: State['data']) => void;
};

export const usePayoutsStore = create<Prettify<State & Actions>>(() => ({
  isLoading: false,
  data: [],
  setIsLoading: (isLoading: State['isLoading']) => ({ isLoading }),
  setPayouts: (data: State['data']) => ({ data }),
}));
