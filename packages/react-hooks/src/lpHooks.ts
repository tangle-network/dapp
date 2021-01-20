import { useMemo, useCallback } from 'react';

import { Vec } from '@polkadot/types';
import { AccountData } from '@polkadot/types/interfaces';
import { CurrencyId, TradingPair, Balance, AccountId } from '@acala-network/types/interfaces';
import { DerivedDexPool } from '@acala-network/api-derive';
import { FixedPointNumber, TokenPair, currencyId2Token } from '@acala-network/sdk-core';

import { useApi } from './useApi';
import { useCall } from './useCall';

export const useEnableLPs = (): TokenPair[] => {
  const { api } = useApi();

  return (api.consts.dex.enabledTradingPairs as Vec<TradingPair>).map((item) => {
    return new TokenPair(currencyId2Token(item[0]), currencyId2Token(item[1]));
  });
};

type LPSize = { [i: string]: FixedPointNumber };

export const useLPSize = (token1?: CurrencyId, token2?: CurrencyId): LPSize => {
  const pool = useCall<DerivedDexPool>(
    token1 && token2 ? 'derive.dex.pool' : '__mock',
    [token1, token2]
  );

  const result = useMemo<LPSize>((): LPSize => {
    if (!token1 || !token2) {
      return {
        [token1?.asToken?.toString() || '']: FixedPointNumber.ZERO,
        [token2?.asToken?.toString() || '']: FixedPointNumber.ZERO
      };
    }

    if (!pool) {
      return {
        [token1.asToken.toString()]: FixedPointNumber.ZERO,
        [token2.asToken.toString()]: FixedPointNumber.ZERO
      };
    }

    const temp: LPSize = {
      [token1.asToken.toString()]: FixedPointNumber.fromInner(pool[0].toString()),
      [token2.asToken.toString()]: FixedPointNumber.fromInner(pool[1].toString())
    };

    return temp;
  }, [pool, token1, token2]);

  return result;
};

export const useLPEnabledCurrencies = (): CurrencyId[] => {
  const { api } = useApi();

  const allTradingPirs = api.consts.dex.enabledTradingPairs as Vec<TradingPair>;

  const temp = allTradingPirs.reduce((acc, cur): Record<string, CurrencyId> => {
    acc[cur[0].asToken.toString()] = cur[0];
    acc[cur[1].asToken.toString()] = cur[1];

    return acc;
  }, {} as Record<string, CurrencyId>);

  return Object.values(temp);
};

export const useLPCurrencies = (): CurrencyId[] => {
  const { api } = useApi();

  const allTradingPirs = api.consts.dex.enabledTradingPairs as Vec<TradingPair>;

  return allTradingPirs.map((item): CurrencyId => api.createType('CurrencyId' as any, { DEXShare: [item[0].asToken.toString(), item[1].asToken.toString()] }));
};

export const useLPTokenAmount = (account: AccountId | string, lp: CurrencyId): FixedPointNumber => {
  const amount = useCall<AccountData>('query.tokens.accounts', [account, lp]);

  return amount ? FixedPointNumber.fromInner(amount.free.toString()) : FixedPointNumber.ZERO;
};

export const useLPShares = (account: AccountId | string, lp: CurrencyId): [FixedPointNumber, FixedPointNumber, FixedPointNumber] => {
  const issuance = useCall<Balance>('query.tokens.totalIssuance', [lp]);
  const owned = useLPTokenAmount(account, lp);
  const _issuance = useMemo(() => issuance ? FixedPointNumber.fromInner(issuance.toString()) : FixedPointNumber.ZERO, [issuance]);
  const ratio = useMemo(() => owned.div(_issuance), [_issuance, owned]);
  const result = useMemo(() => [owned, _issuance, ratio] as [FixedPointNumber, FixedPointNumber, FixedPointNumber], [owned, _issuance, ratio]);

  return result;
};

export const useLPExchangeRate = (token1?: CurrencyId, token2?: CurrencyId): FixedPointNumber => {
  const lpSize = useLPSize(token1, token2);
  const result = useMemo(() => {
    if (!token1 || !token2) return FixedPointNumber.ZERO;

    return lpSize[token1.asToken.toString()].div(lpSize[token2.asToken.toString()]);
  }, [lpSize, token1, token2]);

  return result;
};

interface UseLPReturnType {
  availableLP: boolean;
  exchangeRate: FixedPointNumber;
  size: ReturnType<typeof useLPSize>;
  lpCurrencyId: CurrencyId | null;
  getAddLPSuggestAmount: (exact: CurrencyId, input: number) => FixedPointNumber;
}

export const useLP = (token1?: CurrencyId, token2?: CurrencyId): UseLPReturnType => {
  const { api } = useApi();
  const enableLPs = useEnableLPs();
  const size = useLPSize(token1, token2);
  const exchangeRate = useLPExchangeRate(token1, token2);

  const availableLP = useMemo(() => {
    if (!token1 || !token2) return false;

    const pair = new TokenPair(currencyId2Token(token1), currencyId2Token(token2));

    return !!enableLPs.find((item) => item.isEqual(pair));
  }, [enableLPs, token1, token2]);

  const lpCurrencyId = useMemo(() => {
    if (!token1 || !token2) return null;

    const pair = new TokenPair(currencyId2Token(token1), currencyId2Token(token2)).getPair();

    return api.createType('CurrencyId' as any, { DEXShare: [pair[0].toString(), pair[1].toString()] });
  }, [api, token1, token2]);

  const getAddLPSuggestAmount = useCallback((exact: CurrencyId, input: number) => {
    const _input = new FixedPointNumber(input);

    if (exact.eq(token1)) return _input.div(exchangeRate);

    if (exact.eq(token2)) return _input.times(exchangeRate);

    return FixedPointNumber.ZERO;
  }, [token1, token2, exchangeRate]);

  return {
    availableLP,
    exchangeRate,
    getAddLPSuggestAmount,
    lpCurrencyId,
    size
  };
};
