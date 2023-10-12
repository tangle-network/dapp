import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import useCurrentTypedChainId from '@webb-tools/react-hooks/useCurrentTypedChainId';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import { useCallback, useMemo } from 'react';
import { useConnectWallet } from './useConnectWallet';

function useConnectButtonProps(typedChainId?: number | null) {
  const { activeWallet, switchChain } = useWebContext();

  const { toggleModal, isWalletConnected } = useConnectWallet();

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const activeTypedChainId = useCurrentTypedChainId();

  const content = useMemo(() => {
    if (!isWalletConnected || typeof activeTypedChainId !== 'number') {
      return 'Connect Wallet' as const;
    }

    if (!hasNoteAccount) {
      return 'Create Note Account' as const;
    }

    if (activeTypedChainId !== typedChainId) {
      return 'Switch Chain' as const;
    }
  }, [activeTypedChainId, hasNoteAccount, isWalletConnected, typedChainId]);

  const handleConnect = useCallback(
    async (typedChainId: number) => {
      const nextChain = chainsPopulated[typedChainId];
      if (!nextChain) {
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
      }

      if (!isWalletConnected) {
        toggleModal(true);
        return false;
      }

      if (!hasNoteAccount) {
        setOpenNoteAccountModal(true);
        return false;
      }

      const isNextChainActive = activeTypedChainId === typedChainId;
      if (isNextChainActive) {
        return true;
      }

      if (activeWallet && nextChain.wallets.includes(activeWallet.id)) {
        const newApi = await switchChain(nextChain, activeWallet);
        return Boolean(newApi);
      } else {
        toggleModal(true);
        return false;
      }
    },
    // prettier-ignore
    [activeTypedChainId, activeWallet, hasNoteAccount, isWalletConnected, setOpenNoteAccountModal, switchChain, toggleModal]
  );

  return {
    /**
     * The button content
     */
    content,

    /**
     * The callback to handle connect
     * return `true` if successfully connected,
     * `false` if not connected but modal is opened,
     * **throw `UnsupportedChain` error** if the `typedChainId` is not supported
     */
    handleConnect,
  };
}

export default useConnectButtonProps;
