import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useMemo } from 'react';

import {
  ParachainCurrency,
  LsParachainCurrencyKey,
} from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';

export enum ExchangeRateType {
  NativeToLiquid,
  LiquidToNative,
}

const useExchangeRate = (
  type: ExchangeRateType,
  currency: ParachainCurrency,
) => {
  const { result: tokenPoolAmount } = useApiRx((api) => {
    const key: LsParachainCurrencyKey =
      type === ExchangeRateType.NativeToLiquid
        ? { Native: currency }
        : { lst: currency };

    return api.query.lstMinting.tokenPool(key);
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const { result: lstTotalIssuance } = useApiRx((api) => {
    return api.query.tokens.totalIssuance({ lst: currency });
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const exchangeRate = useMemo(() => {
    if (tokenPoolAmount === null || lstTotalIssuance === null) {
      return null;
    }

    const isEitherZero = tokenPoolAmount.isZero() || lstTotalIssuance.isZero();

    // TODO: Need to review whether this is the right way to handle this edge case.
    // Special case: No native tokens or liquidity available for conversion.
    // Default to 1:1 exchange rate. This also helps prevent division by zero.
    if (isEitherZero) {
      return 1;
    }

    const ratio =
      type === ExchangeRateType.NativeToLiquid
        ? calculateBnRatio(lstTotalIssuance, tokenPoolAmount)
        : calculateBnRatio(tokenPoolAmount, lstTotalIssuance);

    return ratio;
  }, [lstTotalIssuance, tokenPoolAmount, type]);

  return exchangeRate;
};

export default useExchangeRate;
