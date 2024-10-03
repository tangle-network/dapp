import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo, useState } from 'react';

import {
  LsNetworkId,
  LsParachainCurrencyKey,
} from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import { useLsStore } from './useLsStore';
import usePolling from './usePolling';

export enum ExchangeRateType {
  NativeToDerivative,
  DerivativeToNative,
}

const computeExchangeRate = (
  type: ExchangeRateType,
  totalNativeSupply: BN,
  totalDerivativeSupply: BN,
) => {
  const isEitherZero =
    totalNativeSupply.isZero() || totalDerivativeSupply.isZero();

  // TODO: Need to review whether this is the right way to handle this edge case.
  // Special case: No native tokens or liquidity available for conversion.
  // Default to 1:1 exchange rate. This also helps prevent division by zero.
  if (isEitherZero) {
    return 1;
  }

  const ratio =
    type === ExchangeRateType.NativeToDerivative
      ? calculateBnRatio(totalDerivativeSupply, totalNativeSupply)
      : calculateBnRatio(totalNativeSupply, totalDerivativeSupply);

  return ratio;
};

const MAX_BN_OPERATION_NUMBER = 2 ** 26 - 1;

const useLsExchangeRate = (type: ExchangeRateType) => {
  const [exchangeRate, setExchangeRate] = useState<number | Error | null>(null);
  const { selectedProtocolId, selectedNetworkId } = useLsStore();

  const protocol = getLsProtocolDef(selectedProtocolId);

  const { result: tokenPoolAmount } = useApiRx((api) => {
    if (protocol.networkId !== LsNetworkId.TANGLE_RESTAKING_PARACHAIN) {
      return null;
    }

    const key: LsParachainCurrencyKey =
      type === ExchangeRateType.NativeToDerivative
        ? { Native: protocol.currency }
        : { lst: protocol.currency };

    return api.query.lstMinting.tokenPool(key);
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const { result: lstTotalIssuance } = useApiRx((api) => {
    if (protocol.networkId !== LsNetworkId.TANGLE_RESTAKING_PARACHAIN) {
      return null;
    }

    return api.query.tokens.totalIssuance({ lst: protocol.currency });
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const parachainExchangeRate = useMemo(async () => {
    // Not yet ready.
    if (tokenPoolAmount === null || lstTotalIssuance === null) {
      return null;
    }

    return computeExchangeRate(type, tokenPoolAmount, lstTotalIssuance);
  }, [lstTotalIssuance, tokenPoolAmount, type]);

  const fetch = useCallback(async () => {
    let promise: Promise<number | Error | null>;

    switch (selectedNetworkId) {
      case LsNetworkId.TANGLE_RESTAKING_PARACHAIN:
        promise = parachainExchangeRate;

        break;
      // Tangle networks with the `lst` pallet have a fixed exchange
      // rate of 1:1.
      case LsNetworkId.TANGLE_LOCAL:
      case LsNetworkId.TANGLE_MAINNET:
      case LsNetworkId.TANGLE_TESTNET:
        promise = Promise.resolve(1);
    }

    const newExchangeRate = await promise;

    // Still loading. Do not update the value. Display the stale
    // value.
    if (newExchangeRate === null) {
      return;
    }

    setExchangeRate(newExchangeRate);
  }, [parachainExchangeRate, selectedNetworkId]);

  const isRefreshing = usePolling({ effect: fetch });

  return {
    exchangeRate:
      // For some undocumented reason, BN.js can perform number operations
      // on BN instances that are up to 2^26 - 1.
      typeof exchangeRate === 'number'
        ? Math.min(MAX_BN_OPERATION_NUMBER, exchangeRate)
        : exchangeRate,
    isRefreshing,
  };
};

export default useLsExchangeRate;
