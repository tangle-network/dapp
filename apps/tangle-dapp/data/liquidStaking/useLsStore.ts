import { create } from 'zustand';

import { LsNetworkId, LsProtocolId } from '../../constants/liquidStaking/types';
import getLsNetwork from '../../utils/liquidStaking/getLsNetwork';

type State = {
  isStaking: boolean;
  lsNetworkId: LsNetworkId;
  lsProtocolId: LsProtocolId;
  networkEntities: Set<string>;
  lsPoolId: number | null;
};

type Actions = {
  setIsStaking: (isStaking: State['isStaking']) => void;
  setLsProtocolId: (newProtocolId: State['lsProtocolId']) => void;
  setSelectedNetworkId: (newNetworkId: State['lsNetworkId']) => void;
  setLsPoolId: (poolId: number) => void;
  setNetworkEntities: (networkEntities: State['networkEntities']) => void;
};

type Store = State & Actions;

export const useLsStore = create<Store>((set) => ({
  isStaking: true,
  lsPoolId: null,
  networkEntities: new Set<string>(),
  // Default the selected network and protocol to the Tangle testnet,
  // and tTNT, until liquid staking pools are deployed to mainnet.
  lsNetworkId: LsNetworkId.TANGLE_TESTNET,
  lsProtocolId: LsProtocolId.TANGLE_TESTNET,
  setIsStaking: (isStaking) => set({ isStaking }),
  setLsPoolId: (lsPoolId) => set({ lsPoolId }),
  setLsProtocolId: (lsProtocolId) => set({ lsProtocolId }),
  setNetworkEntities: (networkEntities) => set({ networkEntities }),
  setSelectedNetworkId: (lsNetworkId) => {
    const network = getLsNetwork(lsNetworkId);

    set({
      lsNetworkId,
      lsProtocolId: network.defaultProtocolId,
    });
  },
}));
