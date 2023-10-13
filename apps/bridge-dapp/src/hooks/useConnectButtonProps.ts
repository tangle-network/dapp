import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import useCurrentTypedChainId from '@webb-tools/react-hooks/useCurrentTypedChainId';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import { useCallback, useMemo } from 'react';
import { BRIDGE_PATH, SELECT_SOURCE_CHAIN_PATH } from '../constants';
import { useConnectWallet } from './useConnectWallet';
import useNavigateWithPersistParams from './useNavigateWithPersistParams';

function useConnectButtonProps(typedChainId?: number | null) {
  const { activeWallet, switchChain } = useWebContext();

  const { toggleModal } = useConnectWallet();

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const activeTypedChainId = useCurrentTypedChainId();
  const navigate = useNavigateWithPersistParams();

  const content = useMemo(() => {
    if (!activeWallet) {
      return 'Connect Wallet' as const;
    }

    if (typeof activeTypedChainId !== 'number') {
      return 'Select Chain' as const;
    }

    if (!hasNoteAccount) {
      return 'Create Note Account' as const;
    }

    if (activeTypedChainId !== typedChainId) {
      return 'Switch Chain' as const;
    }
  }, [activeTypedChainId, activeWallet, hasNoteAccount, typedChainId]);

  const handleConnect = useCallback(
    async (typedChainId: number) => {
      const nextChain = chainsPopulated[typedChainId];
      if (!nextChain) {
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
      }

      if (!activeWallet) {
        toggleModal(true);
        return false;
      }

      if (typeof activeTypedChainId !== 'number') {
        navigate(`/${BRIDGE_PATH}/${SELECT_SOURCE_CHAIN_PATH}`);
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

      if (nextChain.wallets.includes(activeWallet.id)) {
        const newApi = await switchChain(nextChain, activeWallet);
        return Boolean(newApi);
      } else {
        toggleModal(true);
        return false;
      }
    },
    // prettier-ignore
    [activeTypedChainId, activeWallet, hasNoteAccount, navigate, setOpenNoteAccountModal, switchChain, toggleModal]
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
