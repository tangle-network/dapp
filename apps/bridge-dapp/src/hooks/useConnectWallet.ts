import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, WalletConfig } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';
import { useModal, useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  isModalOpen: boolean;

  /**
   * Toggle or set state of the wallet modal
   */
  toggleModal: (isOpen?: boolean) => void;

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
   * Function to reset the wallet connection state
   * and selected wallet state
   * @returns void
   */
  resetState: () => void;
};

/**
 * Contains logic for wallet connection modal
 * @param defaultModalOpen The default state for wallet modal
 * @returns an object contains state for wallet modal, wallet connection state,
 * a function to switch wallet and a function to reset wallet connection state.
 */
export const useConnectWallet = (
  defaultModalOpen = false
): UseConnectWalletReturnType => {
  const { status: isModalOpen, update, toggle } = useModal(defaultModalOpen);

  const { setMainComponent } = useWebbUI();
  const { activeWallet, switchChain, appEvent } = useWebContext();

  const [walletState, setWalletState] = useState(WalletState.IDLE);
  const [selectedWallet, setSelectedWallet] = useState<
    WalletConfig | undefined
  >(undefined);

  const connectingWalletId = useMemo<number | undefined>(
    () =>
      walletState === WalletState.CONNECTING ? selectedWallet?.id : undefined,
    [selectedWallet?.id, walletState]
  );

  const failedWalletId = useMemo<number | undefined>(
    () => (walletState === WalletState.FAILED ? selectedWallet?.id : undefined),
    [selectedWallet?.id, walletState]
  );

  // Subscribe to app events
  useEffect(() => {
    let isSubscribed = true;

    appEvent.on('walletConnectionState', (state) => {
      switch (state) {
        case 'failed': {
          isSubscribed && setWalletState(WalletState.FAILED);
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
  }, [appEvent, setWalletState]);

  /**
   * Toggle or set state of the wallet modal
   */
  const toggleModal = useCallback(
    (isOpen?: boolean) => {
      // If exists an active wallet, not update the state
      // and close the modal if it's opened
      if (activeWallet) {
        update(false);
        return;
      }

      if (typeof isOpen === 'boolean') {
        update(isOpen);
        return;
      }

      toggle();
    },
    [activeWallet, toggle, update]
  );

  /**
   * Function to switch wallet
   */
  const switchWallet = useCallback(
    async (chain: Chain, selectedWallet: WalletConfig) => {
      setSelectedWallet(() => selectedWallet);
      setWalletState(() => WalletState.CONNECTING);

      const retVal = await switchChain(chain, selectedWallet);

      // If the promise resolved without null, switchWallet was successful.
      if (retVal) {
        update(false);
      }

      setMainComponent(undefined);
    },
    [switchChain, update, setMainComponent]
  );

  /**
   * Function to reset the wallet state to idle
   */
  const resetState = useCallback(() => {
    setWalletState(WalletState.IDLE);
    setSelectedWallet(undefined);
  }, [setWalletState, setSelectedWallet]);

  return {
    isModalOpen,
    toggleModal,
    switchWallet,
    selectedWallet,
    walletState,
    connectingWalletId,
    failedWalletId,
    resetState,
  };
};
