import type { WalletConfig } from '@webb-tools/dapp-config';
import { Maybe } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { BehaviorSubject } from 'rxjs';

const activeWalletSubject = new BehaviorSubject<Maybe<WalletConfig>>(undefined);

const setActiveWallet = (wallet: Maybe<WalletConfig>) =>
  activeWalletSubject.next(wallet);

/** Hook for sharing the actvie wallet subject & setter */
export function useActiveWallet() {
  const activeWallet = useObservableState(activeWalletSubject);
  return [activeWallet, setActiveWallet] as const;
}
