import chainsPopulated from '@tangle-network/dapp-config/chains/chainsPopulated';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { useCallback } from 'react';
import { useAccount, useSwitchChain as useWagmiSwitchChain } from 'wagmi';
import chainToNetwork from '../../utils/chainToNetwork';

const useSwitchChain = () => {
  const { isConnected } = useAccount();
  const { switchChainAsync } = useWagmiSwitchChain();
  const { setNetwork } = useNetworkStore();

  return useCallback(
    async (typedChainId: number) => {
      if (!isConnected) {
        return null;
      }

      const nextChain = chainsPopulated[typedChainId];

      if (nextChain === undefined) {
        return null;
      }
      await switchChainAsync({ chainId: nextChain.id });
      setNetwork(chainToNetwork(typedChainId));
      return true;
    },
    [isConnected, setNetwork, switchChainAsync],
  );
};

export default useSwitchChain;
