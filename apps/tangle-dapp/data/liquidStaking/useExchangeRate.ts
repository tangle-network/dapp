import { TanglePrimitivesCurrencyTokenSymbol } from '@polkadot/types/lookup';
import { useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';

export enum ExchangeRateType {
  NativeToLiquid,
  LiquidToNative,
}

const useExchangeRate = (
  type: ExchangeRateType,
  currency: TanglePrimitivesCurrencyTokenSymbol['type'],
) => {
  const { result: tokenPoolAmount } = useApiRx((api) => {
    const key =
      type === ExchangeRateType.LiquidToNative
        ? { lst: currency }
        : { Native: currency };

    return api.query.lstMinting.tokenPool(key);
  });

  const { result: lstTotalIssuance } = useApiRx((api) => {
    return api.query.tokens.totalIssuance({ lst: currency });
  });

  const exchangeRate = useMemo(() => {
    if (tokenPoolAmount === null || lstTotalIssuance === null) {
      return null;
    }

    const isDivisionByZero =
      (type === ExchangeRateType.NativeToLiquid && tokenPoolAmount.isZero()) ||
      (type === ExchangeRateType.LiquidToNative && lstTotalIssuance.isZero());

    // Special case: No native tokens are available for conversion.
    // Need to handle this here to prevent division by zero.
    if (isDivisionByZero) {
      // TODO: Handle this edge case properly.
      console.warn(
        'EDGE CASE: No native tokens available for conversion when calculating exchange rate',
      );

      return 0;
    }

    return type === ExchangeRateType.NativeToLiquid
      ? calculateBnRatio(lstTotalIssuance, tokenPoolAmount)
      : calculateBnRatio(tokenPoolAmount, lstTotalIssuance);
  }, [lstTotalIssuance, tokenPoolAmount, type]);

  return exchangeRate;
};

export default useExchangeRate;
