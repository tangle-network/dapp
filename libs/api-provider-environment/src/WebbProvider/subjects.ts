import type { Account } from '@webb-tools/abstract-api-provider';
import type { Chain, WalletConfig } from '@webb-tools/dapp-config';
import { Maybe, Nullable } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { BehaviorSubject } from 'rxjs';

/** Active wallet subject */
const activeWalletSubject = new BehaviorSubject<Maybe<WalletConfig>>(undefined);

/** Active wallet setter */
const setActiveWallet = (wallet: Maybe<WalletConfig>) =>
  activeWalletSubject.next(wallet);

/** Hook for sharing the actvie wallet subject & setter */
export function useActiveWallet() {
  const activeWallet = useObservableState(activeWalletSubject);
  return [activeWallet, setActiveWallet] as const;
}

/** Active account subject */
const activeAccountSubject = new BehaviorSubject<Account | null>(null);

/** Active account setter */
const setActiveAccount = (account: Account | null) =>
  activeAccountSubject.next(account);

/** Hook for sharing the active account subject & setter */
export function useActiveAccount() {
  const activeAccount = useObservableState(activeAccountSubject);
  return [activeAccount, setActiveAccount] as const;
}

/**
 * Active chain subject
 * - `undefined` means no chain is active
 * - `null` means the active chain is unsupported
 * - `Chain` means the active chain is supported
 */
const activeChainSubject = new BehaviorSubject<Nullable<Maybe<Chain>>>(
  undefined,
);

/** Active chain setter */
const setActiveChain = (chain: Nullable<Maybe<Chain>>) =>
  activeChainSubject.next(chain);

/** Hook for sharing the active chain subject & setter */
export function useActiveChain() {
  /**
   * Active chain of the app
   * - `undefined` means no chain is active
   * - `null` means the active chain is unsupported
   * - `Chain` means the active chain is supported
   */
  const activeChain = useObservableState(activeChainSubject);

  return [activeChain, setActiveChain] as const;
}
