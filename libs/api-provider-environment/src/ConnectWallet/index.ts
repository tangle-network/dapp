'use client';

import type { SupportedBrowsers } from '@webb-tools/browser-utils/platform/getPlatformMetaData';
import getPlatformMetaData from '@webb-tools/browser-utils/platform/getPlatformMetaData';
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
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo } from 'react';
import { useActiveChain, useActiveWallet } from '../WebbProvider/subjects';
import getDefaultAccount from '../utils/getDefaultAccount';
import { useWebContext } from '../webb-context/webb-context';
import subjects, { WalletState } from './subjects';

export type UseConnectWalletReturnType = {
  /**
   * Boolean to check if the wallet modal is open
   */
  isModalOpen: boolean;

  /**
   * The current browser platform id
   */
  platformId: SupportedBrowsers | null;

  /**
   * Toggle or set state of the wallet modal
   * if the typedChainId is provided, the modal will
   * open with the supported wallet for that chain
   */
  toggleModal: (isOpen?: boolean, typedChainId?: number) => void;

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

  /**
   * Supported wallets
   */
  supportedWallets: WalletConfig[];
};

/**
 * Hook contains the logic to connect open the wallet modal
 * and connect to a wallet
 * @param options.useAllWallet - Boolean to use all supported wallets,
 * if false, only use the wallets that contains the active anchor
 */
const useConnectWallet = (options?: {
  useAllWallets?: boolean;
}): UseConnectWalletReturnType => {
  // Get the states from the subjects
  const isModalOpen = useObservableState(subjects.isWalletModalOpenSubject);
  const selectedWallet = useObservableState(subjects.selectedWalletSubject);

  const walletState = useObservableState(subjects.walletStateSubject);
  const connectError = useObservableState(subjects.connectErrorSubject);
  const typedChainId = useObservableState(subjects.walletTypedChainIdSubject);

  const { appEvent, appName, setActiveAccount, switchChain } = useWebContext();

  const [, setActiveWallet] = useActiveWallet();
  const [, setActiveChain] = useActiveChain();

  const platformId = useMemo(() => {
    const platform = getPlatformMetaData();
    if (platform == null) {
      return null;
    }

    return platform.id;
  }, []);

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
            'Unknown `walletConnectionState` inside `useConnectWallet` hook',
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
  const toggleModal = useCallback(
    (isOpenArg?: boolean, typedChainId?: number) => {
      const isOpen = isOpenArg ?? !subjects.isWalletModalOpenSubject.getValue();

      subjects.setWalletModalOpen(isOpen);

      // If the modal is open and the typedChainId is provided
      // set the next chain
      if (isOpen && typeof typedChainId === 'number') {
        subjects.setWalletTypedChainId(typedChainId);
      }
    },
    [],
  );

  const connectWallet = useCallback(
    async (
      nextWallet: WalletConfig,
      targetTypedChainIds?: {
        evm?: number;
        substrate?: number;
      },
    ) => {
      try {
        subjects.setSelectedWallet(nextWallet);
        subjects.setWalletState(WalletState.CONNECTING);

        const provider = await nextWallet.detect(appName);

        if (provider === undefined) {
          subjects.setWalletState(WalletState.FAILED);
          subjects.setConnectError(new WalletNotInstalledError(nextWallet.id));
          return;
        }

        // If the provider has a connect method, it is a web3 provider
        if ('connect' in provider) {
          const { chainId } = await provider.connect({
            chainId:
              typeof targetTypedChainIds?.evm === 'number'
                ? parseTypedChainId(targetTypedChainIds.evm).chainId
                : typeof typedChainId === 'number'
                  ? parseTypedChainId(typedChainId).chainId
                  : undefined,
          });

          const chain = getChain(chainId, ChainType.EVM);
          if (!chain) {
            setActiveChain(null);
          } else {
            await switchChain(chain, nextWallet);
          }
        } else {
          const targetSubstrateChainId =
            targetTypedChainIds?.substrate ?? typedChainId;
          if (
            typeof targetSubstrateChainId === 'number' &&
            chainsPopulated[targetSubstrateChainId]
          ) {
            await switchChain(
              chainsPopulated[targetSubstrateChainId],
              nextWallet,
            );
          } else {
            const account = await getDefaultAccount(provider);
            setActiveAccount(account);
            setActiveWallet(nextWallet);
            setActiveChain(null);
          }
        }

        subjects.setConnectError(undefined);
        subjects.setWalletState(WalletState.SUCCESS);
        subjects.setWalletModalOpen(false);
      } catch (error) {
        subjects.setWalletState(WalletState.FAILED);
        subjects.setConnectError(
          error instanceof WebbError
            ? error
            : WebbError.from(WebbErrorCodes.FailedToConnectWallet),
        );
      }
    },
    // prettier-ignore
    [appName, setActiveAccount, setActiveChain, setActiveWallet, switchChain, typedChainId],
  );

  /**
   * Function to reset the wallet state to idle
   */
  const resetState = useCallback(() => {
    subjects.setWalletModalOpen(false);
    subjects.setConnectError(undefined);
    subjects.setWalletState(WalletState.IDLE);
    subjects.setSelectedWallet(undefined);
    subjects.setWalletTypedChainId(undefined);
  }, []);

  const memoValues = useMemoValues({
    walletState,
    typedChainId,
    selectedWallet,
    ...options,
  });

  return {
    ...memoValues,
    platformId,
    connectError,
    isModalOpen,
    resetState,
    selectedWallet,
    toggleModal,
    walletState,
    connectWallet,
  };
};

export { useConnectWallet };

/** @internal */
function getChain(chainId: number, chainType: ChainType): Chain | undefined {
  const typedChainId = calculateTypedChainId(chainType, chainId);
  return chainsPopulated[typedChainId];
}

/** @internal */
function useMemoValues(
  props: {
    walletState: WalletState;
    selectedWallet?: WalletConfig;
    typedChainId?: number;
  } & Parameters<typeof useConnectWallet>[0],
) {
  const { walletState, selectedWallet, typedChainId, useAllWallets } = props;
  const { apiConfig, activeWallet, loading } = useWebContext();

  const connectingWalletId = useMemo<number | undefined>(
    () =>
      walletState === WalletState.CONNECTING ? selectedWallet?.id : undefined,
    [selectedWallet?.id, walletState],
  );

  const failedWalletId = useMemo<number | undefined>(
    () => (walletState === WalletState.FAILED ? selectedWallet?.id : undefined),
    [selectedWallet?.id, walletState],
  );

  const isWalletConnected = useMemo(
    () => [activeWallet, !loading].every(Boolean),
    [activeWallet, loading],
  );

  const supportedWallets = useMemo(
    () =>
      apiConfig.getSupportedWallets(typedChainId, {
        filterByActiveAnchor: !useAllWallets,
      }),
    [apiConfig, typedChainId, useAllWallets],
  );

  return {
    connectingWalletId,
    failedWalletId,
    isWalletConnected,
    supportedWallets,
  };
}
