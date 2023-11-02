import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import useCurrentTypedChainId from '@webb-tools/react-hooks/useCurrentTypedChainId';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import { useCallback, useMemo } from 'react';
import { useConnectWallet } from './useConnectWallet';

function useConnectButtonProps(typedChainId?: number | null) {
  const { activeApi = null, activeWallet, switchChain } = useWebContext();

  const { toggleModal } = useConnectWallet();

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const activeTypedChainId = useCurrentTypedChainId();

  const content = useMemo(() => {
    if (!activeWallet) {
      return 'Connect Wallet' as const;
    }

    const chainName =
      typeof typedChainId === 'number'
        ? chainsPopulated[typedChainId]?.name
        : undefined;

    // There is a case where the user has a wallet connected but the chain is not supported
    if (activeTypedChainId === null) {
      return chainName
        ? `Switch to ${chainName}`
        : 'Switch to a supported chain';
    }

    if (!hasNoteAccount) {
      return 'Create Note Account' as const;
    }

    if (activeTypedChainId !== typedChainId) {
      return `Switch ${chainName ? `to ${chainName}` : 'Chain'}` as const;
    }
  }, [activeTypedChainId, activeWallet, hasNoteAccount, typedChainId]);

  const handleConnect = useCallback(
    async (typedChainId: number) => {
      const nextChain = chainsPopulated[typedChainId];
      if (!nextChain) {
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
      }

      if (!activeWallet) {
        toggleModal(true, typedChainId);
        return null;
      }

      const nextChainSupported = nextChain.wallets.includes(activeWallet.id);

      // Handle the case where the user has a wallet connected but the chain is not supported
      if (activeTypedChainId === null) {
        if (nextChainSupported) {
          return switchChain(nextChain, activeWallet);
        } else {
          toggleModal(true, typedChainId);
          return null;
        }
      }

      if (!hasNoteAccount) {
        setOpenNoteAccountModal(true);
        return null;
      }

      const isNextChainActive = activeTypedChainId === typedChainId;
      if (isNextChainActive) {
        return activeApi;
      }

      if (nextChain.wallets.includes(activeWallet.id)) {
        return switchChain(nextChain, activeWallet);
      } else {
        toggleModal(true, typedChainId);
        return null;
      }
    },
    // prettier-ignore
    [activeApi, activeTypedChainId, activeWallet, hasNoteAccount, setOpenNoteAccountModal, switchChain, toggleModal]
  );

  return {
    /**
     * The button content
     */
    content,

    /**
     * The callback to handle connect
     * return the active api if connected,
     * `null` if perform other actions or failed to connect
     * **throw `UnsupportedChain` error** if the `typedChainId` is not supported
     */
    handleConnect,
  };
}

export default useConnectButtonProps;
