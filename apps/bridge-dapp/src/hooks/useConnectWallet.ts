import { useWebContext } from '@webb-tools/api-provider-environment';
import { WalletConfig } from '@webb-tools/dapp-config';
import { useModal } from '@webb-tools/ui-hooks';
import { useCallback, useEffect, useState } from 'react';

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
  switchWallet: (selectedWallet: WalletConfig) => Promise<void> | void;

  /**
   * Wallet connection state for ui display
   */
  walletState: WalletState;

  /**
   * Current selected wallet for ui display
   */
  selectedWallet?: WalletConfig | undefined;

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

  const { activeWallet, switchChain, chains, appEvent } = useWebContext();

  const [walletState, setWalletState] = useState(WalletState.IDLE);
  const [selectedWallet, setSelectedWallet] = useState<
    WalletConfig | undefined
  >(undefined);

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

  // Force close the modal when active wallet is not defiend
  useEffect(() => {
    let isSubscribed = true;

    if (isSubscribed && activeWallet && isModalOpen) {
      update(false); // force close modal
    }

    return () => {
      isSubscribed = false;
    };
  }, [activeWallet, isModalOpen, update]);

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
    async (selectedWallet: WalletConfig) => {
      const { defaultChainToConnect } = selectedWallet;

      const selectedChain = chains[defaultChainToConnect];

      if (!selectedChain) {
        throw new Error(
          'Missing chain id in supported chain id for current wallet'
        );
      }

      setSelectedWallet(selectedWallet);
      setWalletState(WalletState.CONNECTING);

      await switchChain(selectedChain, selectedWallet);
    },
    [chains, switchChain, setSelectedWallet]
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
    resetState,
  };
};
