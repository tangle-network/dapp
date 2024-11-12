import type { Chain } from '@webb-tools/dapp-config';
import { Maybe, Nullable } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { BehaviorSubject } from 'rxjs';

/** Hook for sharing the active chain subject & setter */
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
