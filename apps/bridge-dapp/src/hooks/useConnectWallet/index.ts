import { useActiveWallet } from '@webb-tools/api-provider-environment/WebbProvider';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { WalletConfig } from '@webb-tools/dapp-config';
import { WalletId, WebbError } from '@webb-tools/dapp-types';
import WalletNotInstalledError from '@webb-tools/dapp-types/errors/WalletNotInstalledError';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo } from 'react';
import store, { WalletState } from './subjects';

export type UseConnectWalletReturnType = {
  /**
   * Boolean to check if the wallet modal is open
   */
  isModalOpen: boolean;

  /**
   * Toggle or set state of the wallet modal
   */
  toggleModal: (isOpen?: boolean) => void;

  /**
   * Function to connect wallet
   */
  connectWallet: (wallet: WalletConfig) => Promise<void> | void;

  /**
   * Wallet connection state for ui display
   */
  walletState: WalletState;

  /**
   * Current selected wallet for ui display
   */
  selectedWallet?: WalletConfig | undefined;

  /**
   * Connecting wallet id
   */
  connectingWalletId?: WalletId;

  /**
   * Failed wallet id
   */
  failedWalletId?: WalletId;

  /**
   * Boolean to check if wallet is connected
   */
  isWalletConnected: boolean;

  /**
   * Connect wallet error
   */
  connectError?: WebbError;

  /**
   * Function to reset the wallet connection state
   * and selected wallet state
   * @returns void
   */
  resetState: () => void;
};

/**
 * Hook contains the logic to connect open the wallet modal
 * and connect to a wallet
 */
export const useConnectWallet = (): UseConnectWalletReturnType => {
  // Get the states from the subjects
  const isModalOpen = useObservableState(store.isWalletModalOpenSubject);
  const selectedWallet = useObservableState(store.selectedWalletSubject);

  const walletState = useObservableState(store.walletStateSubject);
  const connectError = useObservableState(store.connectErrorSubject);

  const { appEvent, loading } = useWebContext();
  const [activeWallet, setActiveWallet] = useActiveWallet();

  const connectingWalletId = useMemo<number | undefined>(
    () =>
      walletState === WalletState.CONNECTING ? selectedWallet?.id : undefined,
    [selectedWallet?.id, walletState]
  );

  const failedWalletId = useMemo<number | undefined>(
    () => (walletState === WalletState.FAILED ? selectedWallet?.id : undefined),
    [selectedWallet?.id, walletState]
  );

  const isWalletConnected = useMemo(
    () => [activeWallet, !loading].every(Boolean),
    [activeWallet, loading]
  );

  // Subscribe to app events
  useEffect(() => {
    let isSubscribed = true;

    appEvent.on('walletConnectionState', (state) => {
      switch (state.status) {
        case 'failed': {
          if (isSubscribed) {
            store.setWalletState(WalletState.FAILED);
            store.setConnectError(state.error);
          }
          break;
        }

        case 'loading': {
          isSubscribed && store.setWalletState(WalletState.CONNECTING);
          break;
        }

        case 'sucess': {
          isSubscribed && store.setWalletState(WalletState.SUCCESS);
          break;
        }

        case 'idle': {
          isSubscribed && store.setWalletState(WalletState.IDLE);
          break;
        }

        default: {
          throw new Error(
            'Unknown `walletConnectionState` inside `useConnectWallet` hook'
          );
        }
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [appEvent]);

  /**
   * Toggle or set state of the wallet modal
   * and set the next chain
   */
  const toggleModal = useCallback((isOpenArg?: boolean) => {
    const isOpen = isOpenArg ?? !store.isWalletModalOpenSubject.getValue();

    store.setWalletModalOpen(isOpen);
  }, []);

  const connectWallet = useCallback(
    async (nextWallet: WalletConfig) => {
      store.setSelectedWallet(nextWallet);
      store.setWalletState(WalletState.CONNECTING);

      const isDetected = await nextWallet.detect();

      if (!isDetected) {
        store.setWalletState(WalletState.FAILED);
        store.setConnectError(new WalletNotInstalledError(nextWallet.id));
        return;
      }

      store.setConnectError(undefined);
      store.setWalletState(WalletState.SUCCESS);
      store.setWalletModalOpen(false);
      setActiveWallet(nextWallet);
    },
    [setActiveWallet]
  );

  /**
   * Function to reset the wallet state to idle
   */
  const resetState = useCallback(() => {
    store.setConnectError(undefined);
    store.setWalletModalOpen(false);
    store.setWalletState(WalletState.IDLE);
    store.setSelectedWallet(undefined);
  }, []);

  return {
    connectingWalletId,
    connectError,
    failedWalletId,
    isModalOpen,
    isWalletConnected,
    resetState,
    selectedWallet,
    toggleModal,
    walletState,
    connectWallet,
  };
};
