import {
  useActiveChain,
  useActiveWallet,
} from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import getDefaultAccount from '@webb-tools/api-provider-environment/utils/getDefaultAccount';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import type { SupportedBrowsers } from '@webb-tools/browser-utils/platform/getPlatformMetaData';
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
import subjects, { WalletState } from './subjects';
import getPlatformMetaData from '@webb-tools/browser-utils/platform/getPlatformMetaData';

export type UseConnectWalletReturnType = {
  /**
   * Boolean to check if the wallet modal is open
   */
  isModalOpen: boolean;

  /**
   * The current browser platform id
   */
  platformId?: SupportedBrowsers;

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
 */
const useConnectWallet = (): UseConnectWalletReturnType => {
  // Get the states from the subjects
  const isModalOpen = useObservableState(subjects.isWalletModalOpenSubject);
  const selectedWallet = useObservableState(subjects.selectedWalletSubject);

  const walletState = useObservableState(subjects.walletStateSubject);
  const connectError = useObservableState(subjects.connectErrorSubject);
  const typedChainId = useObservableState(subjects.walletTypedChainIdSubject);

  const { appEvent, setActiveAccount, switchChain } = useWebContext();

  const [, setActiveWallet] = useActiveWallet();
  const [, setActiveChain] = useActiveChain();

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
  const toggleModal = useCallback(
    (isOpenArg?: boolean, typedChainId?: number) => {
      const isOpen = isOpenArg ?? !subjects.isWalletModalOpenSubject.getValue();

      subjects.setWalletModalOpen(isOpen);

      // If the modal is open and the typedChainId is provided
      // set the next chain
      if (isOpen && typeof typedChainId === 'number') {
        subjects.setWalletTypedChainId(typedChainId);
      } else {
        subjects.setWalletTypedChainId(undefined);
      }
    },
    []
  );

  const connectWallet = useCallback(
    async (nextWallet: WalletConfig) => {
      try {
        // Call the getPlatformMetaData function to get check if the browser is supported
        getPlatformMetaData();

        subjects.setSelectedWallet(nextWallet);
        subjects.setWalletState(WalletState.CONNECTING);

        const provider = await nextWallet.detect();

        if (!provider) {
          subjects.setWalletState(WalletState.FAILED);
          subjects.setConnectError(new WalletNotInstalledError(nextWallet.id));
          return;
        }

        // If the provider has a connect method, it is a web3 provider
        if ('connect' in provider) {
          const {
            chain: { id, unsupported },
          } = await provider.connect({
            chainId:
              typeof typedChainId === 'number'
                ? parseTypedChainId(typedChainId).chainId
                : undefined,
          });

          const chain = getChain(id, ChainType.EVM);
          if (unsupported || !chain) {
            setActiveChain(null);
          } else {
            await switchChain(chain, nextWallet);
          }
        } else {
          if (
            typeof typedChainId === 'number' &&
            !chainsPopulated[typedChainId]
          ) {
            await switchChain(chainsPopulated[typedChainId], nextWallet);
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
            : WebbError.from(WebbErrorCodes.FailedToConnectWallet)
        );
      }
    },
    // prettier-ignore
    [setActiveAccount, setActiveChain, setActiveWallet, switchChain, typedChainId]
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

  const memoValues = useMemoValues({
    walletState,
    typedChainId,
    selectedWallet,
  });

  return {
    ...memoValues,
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
function useMemoValues(props: {
  walletState: WalletState;
  selectedWallet?: WalletConfig;
  typedChainId?: number;
}) {
  const { walletState, selectedWallet, typedChainId } = props;
  const { apiConfig, activeWallet, loading } = useWebContext();

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

  const supportedWallets = useMemo(
    () => apiConfig.getSupportedWallets(typedChainId),
    [apiConfig, typedChainId]
  );

  return {
    connectingWalletId,
    failedWalletId,
    isWalletConnected,
    supportedWallets,
  };
}
