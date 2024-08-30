import { create } from 'zustand';

import { LsNetworkId, LsProtocolId } from '../../constants/liquidStaking/types';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';

type State = {
  selectedNetworkId: LsNetworkId;
  selectedProtocolId: LsProtocolId;
  selectedItems: Set<string>;
};

type Actions = {
  setSelectedProtocolId: (newProtocolId: State['selectedProtocolId']) => void;
  setSelectedItems: (selectedItems: State['selectedItems']) => void;
  setSelectedNetworkId: (newNetworkId: State['selectedNetworkId']) => void;
};

type Store = State & Actions;

export const useLsStore = create<Store>((set) => ({
  selectedNetworkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN,
  selectedProtocolId: LsProtocolId.POLKADOT,
  selectedItems: new Set<string>(),
  setSelectedProtocolId: (selectedChainId) =>
    set({ selectedProtocolId: selectedChainId }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
  setSelectedNetworkId: (selectedNetworkId) => {
    const network = getLsNetwork(selectedNetworkId);
    const defaultProtocolId = network.defaultProtocolId;

    set({ selectedNetworkId, selectedProtocolId: defaultProtocolId });
  },
}));
