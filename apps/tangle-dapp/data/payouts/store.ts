import type { Prettify } from 'viem/chains';
import { create } from 'zustand';

import type { Payout } from '../../types';

type State = {
  isLoading: boolean;
  data: Payout[];
};

export const usePayoutsStore = create<Prettify<State>>(() => ({
  isLoading: false,
  data: [],
}));

export const setIsLoading = (isLoading: State['isLoading']) =>
  usePayoutsStore.setState({ isLoading });

export const setPayouts = (data: State['data']) =>
  usePayoutsStore.setState({ data });
