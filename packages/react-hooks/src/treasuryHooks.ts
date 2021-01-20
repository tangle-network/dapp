import { useState, useEffect, useMemo } from 'react';

import { stringToU8a } from '@polkadot/util';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { Balance, CurrencyId } from '@acala-network/types/interfaces';
import { AccountData } from '@polkadot/types/interfaces';

import { useCall } from './useCall';
import { WithNull } from './types';
import { useApi } from './useApi';
import { combineLatest } from 'rxjs';
import { useConstants } from './useConstants';
import { useBalance } from './balanceHooks';

interface TreasuryOverview {
  debitPool: FixedPointNumber;
  surplusPool: FixedPointNumber;
  totalCollaterals: {
    currency: CurrencyId;
    balance: FixedPointNumber;
  }[];
}

export const useTreasuryOverview = (): WithNull<TreasuryOverview> => {
  const { api } = useApi();

  const moduleAccount = useMemo(() => api.createType(
    'AccountId',
    stringToU8a('modl' + ((api.consts.cdpTreasury.moduleId as any).toUtf8() as string).padEnd(32, '\0'))
  ), [api]);

  const { loanCurrencies, stableCurrency } = useConstants();
  const surplusPool = useCall<Balance>('query.cdpTreasury.debitPool');
  const debitPool = useBalance(stableCurrency, moduleAccount);
  const [result, setResult] = useState<WithNull<TreasuryOverview>>(null);

  useEffect(() => {
    const subscriber = combineLatest(
      loanCurrencies.map((currency) => api.query.tokens.accounts<AccountData>(moduleAccount, currency))
    ).subscribe((result) => {
      setResult({
        debitPool: debitPool,
        surplusPool: FixedPointNumber.fromInner(surplusPool?.toString() || 0),
        totalCollaterals: result ? result.map((item, index) => {
          return {
            balance: FixedPointNumber.fromInner(item?.toString() || 0),
            currency: loanCurrencies[index]
          };
        }) : []
      });
    });

    return (): void => subscriber.unsubscribe();
  }, [api.query.tokens, debitPool, surplusPool, setResult, api.query.cdpTreasury, loanCurrencies, moduleAccount]);

  return result;
};
