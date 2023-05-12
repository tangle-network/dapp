import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, WalletConfig } from '@webb-tools/dapp-config';
import { WalletId, WebbError } from '@webb-tools/dapp-types';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

/**
 * Wallet connection enum state
 */
export enum WalletState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type UseConnectWalletReturnType = {
  /**
   * The current chain used to connect to a wallet
   */
  chain?: Chain;

  isModalOpen: boolean;

  /**
   * Toggle or set state of the wallet modal
   */
  toggleModal: (isOpen?: boolean, nextChain?: Chain) => void;

  /**
   * Function to switch wallet
   */
  switchWallet: (
    chain: Chain,
    selectedWallet: WalletConfig
  ) => Promise<void> | void;

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

  /**
   * The set chain to connect to
   */
  setChain: (chain?: Chain) => void;
};

const isWalletModalOpenSubject = new BehaviorSubject<boolean>(false);

const setWalletModalOpen = (isOpen: boolean) =>
  isWalletModalOpenSubject.next(isOpen);

const walletStateSubject = new BehaviorSubject<WalletState>(WalletState.IDLE);

const setWalletState = (state: WalletState) => walletStateSubject.next(state);

const selectedWalletSubject = new BehaviorSubject<WalletConfig | undefined>(
  undefined
);

const setSelectedWallet = (wallet: WalletConfig | undefined) =>
  selectedWalletSubject.next(wallet);

const chainSubject = new BehaviorSubject<Chain | undefined>(undefined);

const setCurrentChain = (chain: Chain | undefined) => chainSubject.next(chain);

const connectErrorSubject = new BehaviorSubject<WebbError | undefined>(
  undefined
);

const setConnectError = (error: WebbError | undefined) =>
  connectErrorSubject.next(error);

/**
 * Hook contains the logic to connect open the wallet modal
 * and connect to a wallet
 */
export const useConnectWallet = (): UseConnectWalletReturnType => {
  // Get the states from the subjects
  const isModalOpen = useObservableState(isWalletModalOpenSubject);
  const walletState = useObservableState(walletStateSubject);
  const selectedWallet = useObservableState(selectedWalletSubject);
  const currentChain = useObservableState(chainSubject);
  const connectError = useObservableState(connectErrorSubject);

  const { setMainComponent } = useWebbUI();

  const {
    switchChain,
    appEvent,
    activeChain,
    activeWallet,
    activeAccount,
    loading,
  } = useWebContext();

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
    () => [activeAccount, activeChain, activeWallet, !loading].every(Boolean),
    [activeAccount, activeChain, activeWallet, loading]
  );

  // Subscribe to app events
  useEffect(() => {
    let isSubscribed = true;

    appEvent.on('walletConnectionState', (state) => {
      switch (state.status) {
        case 'failed': {
          if (isSubscribed) {
            setWalletState(WalletState.FAILED);
            setConnectError(state.error);
          }
          break;
        }

        case 'loading': {
          isSubscribed && setWalletState(WalletState.CONNECTING);
          break;
        }

        case 'sucess': {
          isSubscribed && setWalletState(WalletState.SUCCESS);
          break;
        }

        case 'idle': {
          isSubscribed && setWalletState(WalletState.IDLE);
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
  const toggleModal = useCallback((isOpenArg?: boolean, nextChain?: Chain) => {
    const isOpen = isOpenArg ?? !isWalletModalOpenSubject.getValue();

    if (isOpen && nextChain) {
      setCurrentChain(nextChain);
    }

    setWalletModalOpen(isOpen);
  }, []);

  /**
   * Function to switch wallet
   */
  const switchWallet = useCallback(
    async (chain: Chain, selectedWallet: WalletConfig) => {
      selectedWalletSubject.next(selectedWallet);
      walletStateSubject.next(WalletState.CONNECTING);

      const retVal = await switchChain(chain, selectedWallet);

      // If the promise resolved without null, switchWallet was successful.
      if (retVal) {
        setWalletModalOpen(false);
      }

      setMainComponent(undefined);
    },
    [switchChain, setMainComponent]
  );

  /**
   * Function to reset the wallet state to idle
   */
  const resetState = useCallback(() => {
    setCurrentChain(undefined);
    setWalletState(WalletState.IDLE);
    setSelectedWallet(undefined);
  }, []);

  return {
    chain: currentChain,
    connectingWalletId,
    connectError,
    failedWalletId,
    isModalOpen,
    isWalletConnected,
    resetState,
    selectedWallet,
    setChain: setCurrentChain,
    switchWallet,
    toggleModal,
    walletState,
  };
};
