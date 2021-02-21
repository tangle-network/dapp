import { tokenEq } from '@webb-dapp/react-components';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { Balance, CurrencyId } from '@webb-tools/types/interfaces';
import { useEffect, useMemo, useState } from 'react';
import { combineLatest, Observable } from 'rxjs';

import { Account } from '@polkadot/types/interfaces';

import { AccountLike } from './types';
import { useAccounts } from './useAccounts';
import { useApi } from './useApi';
import { useCall } from './useCall';
import { useConstants } from './useConstants';

export type BalanceData = { currency: CurrencyId; balance: FixedPointNumber };

/**
 * @name useBalance
 * @description get input account or active account  balances of currencie
 * @param currency
 * @param account
 */
export const useBalance = (currency?: CurrencyId, account?: AccountLike): FixedPointNumber => {
  const { active } = useAccounts();
  const _account = useMemo(() => account || (active ? active.address : '_'), [account, active]);
  console.log(_account);
  const acc = useCall<Account>('derive.balances.all', [_account]);
  let balance: FixedPointNumber;
  console.log('Account');
  if (acc) {
    balance = new FixedPointNumber(acc.freeBalance.toString());
  } else {
    balance = FixedPointNumber.ZERO;
  }
  // const balance = null;
  const result = useMemo<FixedPointNumber>((): FixedPointNumber => {
    if (!currency || !balance) {
      return FixedPointNumber.ZERO;
    }

    return FixedPointNumber.fromInner('0');
  }, [balance, currency]);

  return result;
};

/**
 * @name useBalances
 * @description get input account or active account  balances of currencies
 * @param currencies
 * @param account
 */
export const useBalances = (currencies: CurrencyId[], account?: AccountLike): BalanceData[] => {
  const { api } = useApi();
  const { active } = useAccounts();
  const _account = useMemo(() => account || (active ? active.address : '_'), [account, active]);
  const [balances, setBalances] = useState<BalanceData[]>([]);

  useEffect(() => {
    if (!_account) {
      return;
    }

    const subscribe = combineLatest(
      currencies.map((currency: CurrencyId) => {
        return (api.derive as any).currencies.balance(_account, currency) as Observable<Balance>;
      })
    ).subscribe({
      next: (result) => {
        setBalances(
          currencies.map(
            (currency: CurrencyId, index): BalanceData => ({
              balance: result ? FixedPointNumber.fromInner(result[index].toString()) : FixedPointNumber.ZERO,
              currency,
            })
          )
        );
      },
    });

    return (): void => subscribe.unsubscribe();
  }, [_account, api.derive, currencies, setBalances]);

  return balances;
};

/**
 * @name useAllBalances
 * @name get current account or input account all currencies balances
 */
export const useAllBalances = (account?: AccountLike): BalanceData[] => {
  const { allCurrencies } = useConstants();
  const balances = useBalances(allCurrencies, account);

  return balances;
};
