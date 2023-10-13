import {
  useActiveChain,
  useActiveWallet,
} from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import getDefaultAccount from '@webb-tools/api-provider-environment/utils/getDefaultAccount';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import type { Chain, WalletConfig } from '@webb-tools/dapp-config';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import {
  WebbError,
  WebbErrorCodes,
  type WalletId,
} from '@webb-tools/dapp-types';
import WalletNotInstalledError from '@webb-tools/dapp-types/errors/WalletNotInstalledError';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo } from 'react';
import subjects, { WalletState } from './subjects';

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
  const isModalOpen = useObservableState(subjects.isWalletModalOpenSubject);
  const selectedWallet = useObservableState(subjects.selectedWalletSubject);

  const walletState = useObservableState(subjects.walletStateSubject);
  const connectError = useObservableState(subjects.connectErrorSubject);

  const { appEvent, loading, setActiveAccount } = useWebContext();

  const [activeWallet, setActiveWallet] = useActiveWallet();
  const [, setActiveChain] = useActiveChain();

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
            subjects.setWalletState(WalletState.FAILED);
            subjects.setConnectError(state.error);
          }
          break;
        }

        case 'loading': {
          isSubscribed && subjects.setWalletState(WalletState.CONNECTING);
          break;
        }

        case 'sucess': {
          isSubscribed && subjects.setWalletState(WalletState.SUCCESS);
          break;
        }

        case 'idle': {
          isSubscribed && subjects.setWalletState(WalletState.IDLE);
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
    const isOpen = isOpenArg ?? !subjects.isWalletModalOpenSubject.getValue();

    subjects.setWalletModalOpen(isOpen);
  }, []);

  const connectWallet = useCallback(
    async (nextWallet: WalletConfig) => {
      try {
        subjects.setSelectedWallet(nextWallet);
        subjects.setWalletState(WalletState.CONNECTING);

        const provider = await nextWallet.detect();

        if (!provider) {
          subjects.setWalletState(WalletState.FAILED);
          subjects.setConnectError(new WalletNotInstalledError(nextWallet.id));
          return;
        }

        if ('connect' in provider) {
          const {
            chain: { id, unsupported },
          } = await provider.connect();

          const chain = getChain(id, ChainType.EVM);
          setActiveChain(unsupported || !chain ? null : chain);
        }

        subjects.setConnectError(undefined);
        subjects.setWalletState(WalletState.SUCCESS);
        subjects.setWalletModalOpen(false);

        const account = await getDefaultAccount(provider);
        setActiveAccount(account);
        setActiveWallet(nextWallet);
      } catch (error) {
        subjects.setWalletState(WalletState.FAILED);
        subjects.setConnectError(
          error instanceof WebbError
            ? error
            : WebbError.from(WebbErrorCodes.FailedToConnectWallet)
        );
      }
    },
    [setActiveAccount, setActiveChain, setActiveWallet]
  );

  /**
   * Function to reset the wallet state to idle
   */
  const resetState = useCallback(() => {
    subjects.setConnectError(undefined);
    subjects.setWalletModalOpen(false);
    subjects.setWalletState(WalletState.IDLE);
    subjects.setSelectedWallet(undefined);
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

function getChain(chainId: number, chainType: ChainType): Chain | undefined {
  const typedChainId = calculateTypedChainId(chainType, chainId);
  return chainsPopulated[typedChainId];
}
