import type { Account } from '@webb-tools/abstract-api-provider';
import { useObservableState } from 'observable-hooks';
import { BehaviorSubject } from 'rxjs';

const activeAccountSubject = new BehaviorSubject<Account | null>(null);

const setActiveAccount = (account: Account | null) =>
  activeAccountSubject.next(account);

export function useActiveAccount() {
  const activeAccount = useObservableState(activeAccountSubject);
  return [activeAccount, setActiveAccount] as const;
}
