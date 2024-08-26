import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { erc20Abi } from 'viem';

import LIQUIFIER_ADAPTER_ABI from '../../constants/liquidStaking/liquifierAdapterAbi';
import LIQUIFIER_TG_TOKEN_ABI from '../../constants/liquidStaking/liquifierTgTokenAbi';
import {
  LsParachainCurrencyKey,
  LsProtocolId,
} from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import useContractRead from '../liquifier/useContractRead';
import { ContractReadOptions } from '../liquifier/useContractReadOnce';
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

const useExchangeRate = (type: ExchangeRateType, protocolId: LsProtocolId) => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const protocol = getLsProtocolDef(protocolId);

  const { result: tokenPoolAmount } = useApiRx((api) => {
    if (protocol.type !== 'parachain') {
      return null;
    }

    const key: LsParachainCurrencyKey =
      type === ExchangeRateType.NativeToDerivative
        ? { Native: protocol.currency }
        : { lst: protocol.currency };

    return api.query.lstMinting.tokenPool(key);
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const { result: lstTotalIssuance } = useApiRx((api) => {
    if (protocol.type !== 'parachain') {
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

  const tgTokenTotalSupplyFetcher = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_TG_TOKEN_ABI,
    'totalSupply'
  > | null => {
    if (protocol.type !== 'liquifier') {
      return null;
    }

    return {
      address: protocol.erc20TokenAddress,
      functionName: 'totalSupply',
      args: [],
    };
  }, [protocol]);

  const liquifierTotalSharesFetcher = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_ADAPTER_ABI,
    'totalShares'
  > | null => {
    if (protocol.type !== 'liquifier') {
      return null;
    }

    return {
      address: protocol.liquifierContractAddress,
      functionName: 'totalShares',
      args: [],
    };
  }, [protocol]);

  const {
    value: tgTokenTotalSupply,
    setIsPaused: setIsTgTokenTotalSupplyPaused,
  } = useContractRead(erc20Abi, tgTokenTotalSupplyFetcher);

  const {
    value: liquifierTotalShares,
    setIsPaused: setIsLiquifierTotalSharesPaused,
  } = useContractRead(LIQUIFIER_ADAPTER_ABI, liquifierTotalSharesFetcher);

  const fetchLiquifierExchangeRate = useCallback(async () => {
    // Not yet ready.
    if (
      tgTokenTotalSupply === null ||
      liquifierTotalShares === null ||
      tgTokenTotalSupply instanceof Error ||
      liquifierTotalShares instanceof Error
    ) {
      return null;
    }

    const tgTokenTotalSupplyBn = new BN(tgTokenTotalSupply.toString());
    const liquifierTotalSharesBn = new BN(liquifierTotalShares.toString());

    return computeExchangeRate(
      type,
      tgTokenTotalSupplyBn,
      liquifierTotalSharesBn,
    );
  }, [liquifierTotalShares, tgTokenTotalSupply, type]);

  const fetcher = useCallback(async () => {
    const promise =
      protocol.type === 'parachain'
        ? parachainExchangeRate
        : fetchLiquifierExchangeRate();

    setExchangeRate(await promise);
  }, [fetchLiquifierExchangeRate, parachainExchangeRate, protocol]);

  // Pause or resume ERC20-based exchange rate fetching based
  // on whether the requested protocol is a parachain or an ERC20 token.
  // This helps prevent unnecessary requests.
  useEffect(() => {
    const isPaused = protocol.type === 'parachain';

    setIsTgTokenTotalSupplyPaused(isPaused);
    setIsLiquifierTotalSharesPaused(isPaused);
  }, [
    protocol.type,
    setIsLiquifierTotalSharesPaused,
    setIsTgTokenTotalSupplyPaused,
  ]);

  const isRefreshing = usePolling({ effect: fetcher });

  return { exchangeRate, isRefreshing };
};

export default useExchangeRate;
