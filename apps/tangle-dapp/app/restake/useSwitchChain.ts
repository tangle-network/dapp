import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { useCallback } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import chainToNetwork from '../../utils/chainToNetwork';

export default function useSwitchChain() {
  const { activeWallet, activeApi, switchChain } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const { setNetwork } = useNetworkStore();

  return useCallback(
    async (typedChainId: number) => {
      if (activeWallet === undefined || activeApi === undefined) {
        return toggleModal(true, typedChainId);
      }

      const nextChain = chainsPopulated[typedChainId];
      if (nextChain === undefined) return;

      const isWalletSupported = nextChain.wallets.includes(activeWallet.id);

      if (!isWalletSupported) {
        return toggleModal(true, typedChainId);
      } else {
        const switchResult = await switchChain(nextChain, activeWallet);
        if (switchResult !== null) {
          const nextNetwork = chainToNetwork(typedChainId);
          setNetwork(nextNetwork);
        }

        return switchResult;
      }
    },
    [activeApi, activeWallet, setNetwork, switchChain, toggleModal],
  );
}
