import { create } from 'zustand';

import { LsProtocolId } from '../../constants/liquidStaking/types';

type State = {
  selectedProtocolId: LsProtocolId;
  selectedItems: Set<string>;
};

type Actions = {
  setSelectedProtocolId: (selectedChainId: State['selectedProtocolId']) => void;
  setSelectedItems: (selectedItems: State['selectedItems']) => void;
};

type Store = State & Actions;

export const useLiquidStakingStore = create<Store>((set) => ({
  selectedProtocolId: LsProtocolId.TANGLE_RESTAKING_PARACHAIN,
  selectedItems: new Set<string>(),
  setSelectedProtocolId: (selectedChainId) =>
    set({ selectedProtocolId: selectedChainId }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
}));
