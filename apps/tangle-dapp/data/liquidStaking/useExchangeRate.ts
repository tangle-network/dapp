import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useMemo } from 'react';

import { LiquidStakingCurrency } from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';
import Optional from '../../utils/Optional';

export enum ExchangeRateType {
  NativeToLiquid,
  LiquidToNative,
}

const useExchangeRate = (
  type: ExchangeRateType,
  currency: LiquidStakingCurrency,
) => {
  const { result: tokenPoolAmount } = useApiRx((api) => {
    const key =
      type === ExchangeRateType.LiquidToNative
        ? { lst: currency }
        : { Native: currency };

    return api.query.lstMinting.tokenPool(key);
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const { result: lstTotalIssuance } = useApiRx((api) => {
    return api.query.tokens.totalIssuance({ lst: currency });
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const exchangeRate = useMemo<Optional<number> | null>(() => {
    if (tokenPoolAmount === null || lstTotalIssuance === null) {
      console.debug(tokenPoolAmount?.toString(), lstTotalIssuance?.toString());
      return null;
    }

    const isDivisionByZero =
      (type === ExchangeRateType.NativeToLiquid && tokenPoolAmount.isZero()) ||
      (type === ExchangeRateType.LiquidToNative && lstTotalIssuance.isZero());

    // Special case: No native tokens are available for conversion.
    // Need to handle this here to prevent division by zero.
    if (isDivisionByZero) {
      return new Optional();
    }

    const ratio =
      type === ExchangeRateType.NativeToLiquid
        ? calculateBnRatio(lstTotalIssuance, tokenPoolAmount)
        : calculateBnRatio(tokenPoolAmount, lstTotalIssuance);

    return new Optional(ratio);
  }, [lstTotalIssuance, tokenPoolAmount, type]);

  return exchangeRate;
};

export default useExchangeRate;
