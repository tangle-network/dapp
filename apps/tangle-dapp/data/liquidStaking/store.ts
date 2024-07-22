import { create } from 'zustand';

import { LiquidStakingChainId } from '../../constants/liquidStaking';

type State = {
  selectedChainId: LiquidStakingChainId;
};

type Actions = {
  setSelectedChainId: (selectedChainId: State['selectedChainId']) => void;
};

type Store = State & Actions;

export const useLiquidStakingStore = create<Store>((set) => ({
  selectedChainId: LiquidStakingChainId.TANGLE_RESTAKING_PARACHAIN,
  setSelectedChainId: (selectedChainId) => set({ selectedChainId }),
}));
