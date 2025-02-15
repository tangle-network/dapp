import { useConnectWallet } from '@tangle-network/api-provider-environment/ConnectWallet';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import chainsPopulated from '@tangle-network/dapp-config/chains/chainsPopulated';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { useCallback } from 'react';
import chainToNetwork from '../../utils/chainToNetwork';

const useSwitchChain = () => {
  const { activeWallet, activeApi, switchChain } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const { setNetwork } = useNetworkStore();

  return useCallback(
    async (typedChainId: number) => {
      if (activeWallet === undefined || activeApi === undefined) {
        return toggleModal(true, typedChainId);
      }

      const nextChain = chainsPopulated[typedChainId];

      if (nextChain === undefined) {
        return;
      }

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
};

export default useSwitchChain;
