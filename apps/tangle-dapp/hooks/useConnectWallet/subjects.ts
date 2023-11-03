import type { WalletConfig } from '@webb-tools/dapp-config';
import { Maybe } from '@webb-tools/dapp-types/utils/types';
import type { WebbError } from '@webb-tools/dapp-types/WebbError';
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

const isWalletModalOpenSubject = new BehaviorSubject<boolean>(false);
const setWalletModalOpen = (isOpen: boolean) =>
  isWalletModalOpenSubject.next(isOpen);

const walletStateSubject = new BehaviorSubject<WalletState>(WalletState.IDLE);
const setWalletState = (state: WalletState) => walletStateSubject.next(state);

const connectErrorSubject = new BehaviorSubject<Maybe<WebbError>>(undefined);
const setConnectError = (error: Maybe<WebbError>) =>
  connectErrorSubject.next(error);

const selectedWalletSubject = new BehaviorSubject<Maybe<WalletConfig>>(
  undefined
);
const setSelectedWallet = (wallet: Maybe<WalletConfig>) =>
  selectedWalletSubject.next(wallet);

const walletTypedChainIdSubject = new BehaviorSubject<Maybe<number>>(undefined);
const setWalletTypedChainId = (chainId: Maybe<number>) =>
  walletTypedChainIdSubject.next(chainId);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  isWalletModalOpenSubject,
  setWalletModalOpen,
  walletStateSubject,
  setWalletState,
  connectErrorSubject,
  setConnectError,
  selectedWalletSubject,
  setSelectedWallet,
  walletTypedChainIdSubject,
  setWalletTypedChainId,
};
