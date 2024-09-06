import { create } from 'zustand';

import { LsNetworkId, LsProtocolId } from '../../constants/liquidStaking/types';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';

type State = {
  selectedNetworkId: LsNetworkId;
  selectedProtocolId: LsProtocolId;
  selectedNetworkEntities: Set<string>;
  selectedParachainPoolId: string | null;
};

type Actions = {
  setSelectedProtocolId: (newProtocolId: State['selectedProtocolId']) => void;
  setSelectedNetworkId: (newNetworkId: State['selectedNetworkId']) => void;
  setSelectedParachainPoolId: (parachainPoolId: string) => void;

  setSelectedNetworkEntities: (
    selectedNetworkEntities: State['selectedNetworkEntities'],
  ) => void;
};

type Store = State & Actions;

export const useLsStore = create<Store>((set) => ({
  selectedParachainPoolId: null,
  selectedNetworkId: LsNetworkId.TANGLE_RESTAKING_PARACHAIN,
  selectedProtocolId: LsProtocolId.POLKADOT,
  selectedNetworkEntities: new Set<string>(),
  setSelectedParachainPoolId: (selectedParachainPoolId) =>
    set({ selectedParachainPoolId }),
  setSelectedProtocolId: (selectedChainId) =>
    set({ selectedProtocolId: selectedChainId }),
  setSelectedNetworkEntities: (selectedNetworkEntities) =>
    set({ selectedNetworkEntities }),
  setSelectedNetworkId: (selectedNetworkId) => {
    const network = getLsNetwork(selectedNetworkId);
    const defaultProtocolId = network.defaultProtocolId;

    set({ selectedNetworkId, selectedProtocolId: defaultProtocolId });
  },
}));
