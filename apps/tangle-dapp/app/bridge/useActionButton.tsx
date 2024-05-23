'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { useCallback, useMemo } from 'react';

export default function useActionButton() {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { toggleModal } = useConnectWallet();

  const noActiveAccountOrWallet = useMemo(() => {
    return !activeAccount || !activeWallet;
  }, [activeAccount, activeWallet]);

  const openWalletModal = useCallback(() => {
    toggleModal(true);
  }, [toggleModal]);

  const bridgeTx = useCallback(() => {
    // TODO: handle bridge Tx for each case from the source and destination chain
  }, []);

  return {
    isLoading: loading || isConnecting,
    buttonAction: noActiveAccountOrWallet ? openWalletModal : bridgeTx,
    buttonText: noActiveAccountOrWallet ? 'Connect' : 'Approve',
  };
}
