import { create } from 'zustand';

import { LsProtocolId } from '../../constants/liquidStaking/types';

type State = {
  selectedChainId: LsProtocolId;
  selectedItems: Set<string>;
};

type Actions = {
  setSelectedChainId: (selectedChainId: State['selectedChainId']) => void;
  setSelectedItems: (selectedItems: State['selectedItems']) => void;
};

type Store = State & Actions;

export const useLiquidStakingStore = create<Store>((set) => ({
  selectedChainId: LsProtocolId.TANGLE_RESTAKING_PARACHAIN,
  selectedItems: new Set<string>(),
  setSelectedChainId: (selectedChainId) => set({ selectedChainId }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
}));
