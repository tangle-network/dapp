import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { erc20Abi } from 'viem';

import LIQUIFIER_ADAPTER_ABI from '../../constants/liquidStaking/liquifierAdapterAbi';
import LIQUIFIER_TG_TOKEN_ABI from '../../constants/liquidStaking/liquifierTgTokenAbi';
import {
  LsNetworkId,
  LsParachainCurrencyKey,
} from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import useContractRead from '../liquifier/useContractRead';
import { ContractReadOptions } from '../liquifier/useContractReadOnce';
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

  const getTgTokenTotalSupplyOptions = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_TG_TOKEN_ABI,
    'totalSupply'
  > | null => {
    if (protocol.networkId !== LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER) {
      return null;
    }

    return {
      address: protocol.erc20TokenAddress,
      functionName: 'totalSupply',
      args: [],
    };
  }, [protocol]);

  const getLiquifierTotalSharesOptions = useCallback((): ContractReadOptions<
    typeof LIQUIFIER_ADAPTER_ABI,
    'totalShares'
  > | null => {
    if (protocol.networkId !== LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER) {
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
  } = useContractRead(erc20Abi, getTgTokenTotalSupplyOptions);

  const {
    value: liquifierTotalShares,
    setIsPaused: setIsLiquifierTotalSharesPaused,
  } = useContractRead(LIQUIFIER_ADAPTER_ABI, getLiquifierTotalSharesOptions);

  const fetchLiquifierExchangeRate = useCallback(async () => {
    // Propagate error or loading states.
    if (typeof tgTokenTotalSupply !== 'bigint') {
      return tgTokenTotalSupply;
    } else if (typeof liquifierTotalShares !== 'bigint') {
      return liquifierTotalShares;
    }

    const tgTokenTotalSupplyBn = new BN(tgTokenTotalSupply.toString());
    const liquifierTotalSharesBn = new BN(liquifierTotalShares.toString());

    return computeExchangeRate(
      type,
      tgTokenTotalSupplyBn,
      liquifierTotalSharesBn,
    );
  }, [liquifierTotalShares, tgTokenTotalSupply, type]);

  const fetch = useCallback(async () => {
    let promise: Promise<number | Error | null>;

    switch (selectedNetworkId) {
      case LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER:
        promise = fetchLiquifierExchangeRate();

        break;
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
  }, [fetchLiquifierExchangeRate, parachainExchangeRate, selectedNetworkId]);

  // Pause or resume ERC20-based exchange rate fetching based
  // on whether the requested protocol is a parachain or an ERC20 token.
  // This helps prevent unnecessary requests.
  useEffect(() => {
    const isPaused =
      protocol.networkId === LsNetworkId.TANGLE_RESTAKING_PARACHAIN;

    setIsTgTokenTotalSupplyPaused(isPaused);
    setIsLiquifierTotalSharesPaused(isPaused);
  }, [
    protocol.networkId,
    setIsLiquifierTotalSharesPaused,
    setIsTgTokenTotalSupplyPaused,
  ]);

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
