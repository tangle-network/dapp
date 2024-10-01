import { create } from 'zustand';

import { LsNetworkId, LsProtocolId } from '../../constants/liquidStaking/types';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';

type State = {
  selectedNetworkId: LsNetworkId;
  selectedProtocolId: LsProtocolId;
  selectedNetworkEntities: Set<string>;
  selectedPoolId: number | null;
};

type Actions = {
  setSelectedProtocolId: (newProtocolId: State['selectedProtocolId']) => void;
  setSelectedNetworkId: (newNetworkId: State['selectedNetworkId']) => void;
  setSelectedPoolId: (poolId: number) => void;

  setSelectedNetworkEntities: (
    selectedNetworkEntities: State['selectedNetworkEntities'],
  ) => void;
};

type Store = State & Actions;

export const useLsStore = create<Store>((set) => ({
  selectedPoolId: null,
  selectedNetworkEntities: new Set<string>(),
  // Default the selected network and protocol to the Tangle testnet,
  // and tTNT, until liquid staking pools are deployed to mainnet.
  selectedNetworkId: LsNetworkId.TANGLE_TESTNET,
  selectedProtocolId: LsProtocolId.TANGLE_TESTNET,
  setSelectedPoolId: (selectedPoolId) => set({ selectedPoolId }),
  setSelectedProtocolId: (selectedProtocolId) => set({ selectedProtocolId }),
  setSelectedNetworkEntities: (selectedNetworkEntities) =>
    set({ selectedNetworkEntities }),
  setSelectedNetworkId: (selectedNetworkId) => {
    const network = getLsNetwork(selectedNetworkId);
    const defaultProtocolId = network.defaultProtocolId;

    set({ selectedNetworkId, selectedProtocolId: defaultProtocolId });
  },
}));
