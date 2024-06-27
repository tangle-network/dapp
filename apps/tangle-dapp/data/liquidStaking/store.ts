import { create } from 'zustand';

import { LiquidStakingChain } from '../../constants/liquidStaking';

type State = {
  selectedChain: LiquidStakingChain;
};

type Actions = {
  setSelectedChain: (selectedChain: State['selectedChain']) => void;
};

type Store = State & Actions;

export const useLiquidStakingStore = create<Store>((set) => ({
  selectedChain: LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN,
  setSelectedChain: (selectedChain) => set({ selectedChain }),
}));
