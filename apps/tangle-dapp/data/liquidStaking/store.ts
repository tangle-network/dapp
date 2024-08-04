import { create } from 'zustand';

import { LsChainId } from '../../constants/liquidStaking';

type State = {
  selectedChainId: LsChainId;
  selectedItems: Set<string>;
};

type Actions = {
  setSelectedChainId: (selectedChainId: State['selectedChainId']) => void;
  setSelectedItems: (selectedItems: State['selectedItems']) => void;
};

type Store = State & Actions;

export const useLiquidStakingStore = create<Store>((set) => ({
  selectedChainId: LsChainId.TANGLE_RESTAKING_PARACHAIN,
  selectedItems: new Set<string>(),
  setSelectedChainId: (selectedChainId) => set({ selectedChainId }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
}));
