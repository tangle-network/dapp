import { useState, useEffect, useMemo } from 'react';
import { combineLatest, Observable } from 'rxjs';

import { CurrencyId, Balance } from '@acala-network/types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';

import { tokenEq } from '@webb-dapp/react-components';

import { useApi } from './useApi';
import { useAccounts } from './useAccounts';
import { useCall } from './useCall';
import { useConstants } from './useConstants';
import { AccountLike } from './types';
import { usePrice, useAllPrices, PriceData } from './priceHooks';

export type BalanceData = { currency: CurrencyId ; balance: FixedPointNumber };

/**
 * @name useBalance
 * @description get input account or active account  balances of currencie
 * @param currency
 * @param account
 */
export const useBalance = (currency?: CurrencyId, account?: AccountLike): FixedPointNumber => {
  const { active } = useAccounts();
  const _account = useMemo(() => account || (active ? active.address : '_'), [account, active]);
  const balance = useCall<Balance>('derive.currencies.balance', [_account, currency]);
  const result = useMemo<FixedPointNumber>((): FixedPointNumber => {
    if (!currency || !balance) {
      return FixedPointNumber.ZERO;
    }

    return FixedPointNumber.fromInner(balance.toString());
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

    const subscribe = combineLatest(currencies.map((currency: CurrencyId) => {
      return (api.derive as any).currencies.balance(_account, currency) as Observable<Balance>;
    })).subscribe({
      next: (result) => {
        setBalances(
          currencies.map((currency: CurrencyId, index): BalanceData => ({
            balance: result ? FixedPointNumber.fromInner(result[index].toString()) : FixedPointNumber.ZERO,
            currency
          }))
        );
      }
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

/**
 * @name useValue
 * @description get currency value in USD
 * @param currency
 * @param account
 */
export const useValue = (currency: CurrencyId, account?: AccountLike): FixedPointNumber => {
  const balance = useBalance(currency, account);
  const price = usePrice(currency);

  if (!balance || !price) {
    return FixedPointNumber.ZERO;
  }

  return balance.times(price);
};

const calcTotalAmount = (prices: PriceData[], amount: BalanceData[]): FixedPointNumber => {
  return amount.reduce((acc: FixedPointNumber, current: BalanceData): FixedPointNumber => {
    const price = prices.find((value: PriceData): boolean => tokenEq(value.currency, current.currency));
    const amount = ((price && price.price) || FixedPointNumber.ZERO).times(current.balance);

    return acc.plus(amount);
  }, FixedPointNumber.ZERO);
};

/**
 * @name useTotalValue
 * @description get total value in USD of all currencies
 * @param account
 */
export const useTotalValue = (account?: AccountLike): FixedPointNumber => {
  const { allCurrencies } = useConstants();
  const balances = useBalances(allCurrencies, account);
  const prices = useAllPrices();
  const [result, setResult] = useState<FixedPointNumber>(FixedPointNumber.ZERO);

  useEffect(() => {
    if (balances && prices) {
      setResult(calcTotalAmount(prices, balances));
    }
  }, [balances, prices]);

  return result;
};

export const useIssuance = (currency: CurrencyId): FixedPointNumber => {
  const issuance = useCall<Balance>('query.tokens.totalIssuance', [currency]);

  return issuance ? FixedPointNumber.fromInner(issuance.toString()) : FixedPointNumber.ZERO;
};
