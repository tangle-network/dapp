import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, WalletConfig } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';
import { useWebbUI } from '@webb-tools/webb-ui-components';
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

let isWalletModalOpenSubject: BehaviorSubject<boolean>;

let walletStateSubject: BehaviorSubject<WalletState>;

let selectedWalletSubject: BehaviorSubject<WalletConfig | undefined>;

let chainSubject: BehaviorSubject<Chain | undefined>;

/**
 * Hook contains the logic to connect open the wallet modal
 * and connect to a wallet
 */
export const useConnectWallet = (): UseConnectWalletReturnType => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [walletState, setWalletState] = useState(WalletState.IDLE);

  const [selectedWallet, setSelectedWallet] = useState<
    WalletConfig | undefined
  >(undefined);

  const [currentChain, setCurrentChain] = useState<Chain | undefined>();

  const { setMainComponent } = useWebbUI();

  const {
    switchChain,
    appEvent,
    activeChain,
    activeWallet,
    activeAccount,
    loading,
  } = useWebContext();

  if (!isWalletModalOpenSubject) {
    isWalletModalOpenSubject = new BehaviorSubject<boolean>(false);
  }

  if (!selectedWalletSubject) {
    selectedWalletSubject = new BehaviorSubject<WalletConfig | undefined>(
      undefined
    );
  }

  if (!walletStateSubject) {
    walletStateSubject = new BehaviorSubject<WalletState>(WalletState.IDLE);
  }

  if (!chainSubject) {
    chainSubject = new BehaviorSubject<Chain | undefined>(undefined);
  }

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
  }, [appEvent]);

  // Subscribe to subjects to update states
  useEffect(() => {
    let isSubscribed = true;

    const isWalletModalOpenSubscription = isWalletModalOpenSubject.subscribe(
      (isOpen) => {
        isSubscribed && setIsModalOpen(() => isOpen);
      }
    );

    const selectedWalletSubscription = selectedWalletSubject.subscribe(
      (wallet) => {
        isSubscribed && setSelectedWallet(() => wallet);
      }
    );

    const walletStateSubscription = walletStateSubject.subscribe((state) => {
      isSubscribed && setWalletState(() => state);
    });

    const chainSubscription = chainSubject.subscribe((chain) => {
      isSubscribed && setCurrentChain(() => chain);
    });

    return () => {
      isSubscribed = false;

      isWalletModalOpenSubscription.unsubscribe();
      selectedWalletSubscription.unsubscribe();
      walletStateSubscription.unsubscribe();
      chainSubscription.unsubscribe();
    };
  }, []);

  /**
   * Toggle or set state of the wallet modal
   * and set the next chain
   */
  const toggleModal = useCallback((isOpenArg?: boolean, nextChain?: Chain) => {
    const isOpen = isOpenArg ?? !isWalletModalOpenSubject.value;

    if (isOpen && nextChain) {
      chainSubject.next(nextChain);
    }

    isWalletModalOpenSubject.next(isOpen);
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
        isWalletModalOpenSubject.next(false);
      }

      setMainComponent(undefined);
    },
    [switchChain, setMainComponent]
  );

  /**
   * Function to reset the wallet state to idle
   */
  const resetState = useCallback(() => {
    chainSubject.next(undefined);
    walletStateSubject.next(WalletState.IDLE);
    selectedWalletSubject.next(undefined);
  }, []);

  /**
   * The set chain function to be used by the wallet modal
   */
  const setChain = useCallback((chain?: Chain) => {
    chainSubject.next(chain);
  }, []);

  return {
    chain: currentChain,
    connectingWalletId,
    failedWalletId,
    isModalOpen,
    isWalletConnected,
    resetState,
    selectedWallet,
    setChain,
    switchWallet,
    toggleModal,
    walletState,
  };
};
