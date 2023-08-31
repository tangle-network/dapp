import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AMOUNT_KEY,
  POOL_KEY,
  RECIPIENT_KEY,
  SOURCE_CHAIN_KEY,
} from '../../../../../constants';
import { useMaxFeeInfo } from '../../../../../hooks/useMaxFeeInfo';

export type UseFeeCalculationArgs = {
  activeRelayer?: OptionalActiveRelayer;
  recipientErrorMsg?: string;
};

export default function useFeeCalculation(args: UseFeeCalculationArgs) {
  const { activeRelayer, recipientErrorMsg } = args;

  const { apiConfig } = useWebContext();

  const [searchParams] = useSearchParams();

  const [amount, poolId, srcTypedChainId, recipient] = useMemo(() => {
    return [
      searchParams.get(AMOUNT_KEY),
      searchParams.get(POOL_KEY),
      searchParams.get(SOURCE_CHAIN_KEY),
      searchParams.get(RECIPIENT_KEY),
    ];
  }, [searchParams]);

  const fungibleCfg = useMemo(() => {
    if (poolId) {
      return apiConfig.currencies[parseInt(poolId)];
    }
  }, [apiConfig.currencies, poolId]);

  const srcChainCfg = useMemo(() => {
    if (srcTypedChainId) {
      return apiConfig.chains[parseInt(srcTypedChainId)];
    }
  }, [apiConfig.chains, srcTypedChainId]);

  const feeArgs = useMemo(
    () => ({
      fungibleCurrencyId: fungibleCfg?.id,
    }),
    [fungibleCfg?.id]
  );

  const { isLoading, feeInfo, fetchFeeInfo, resetMaxFeeInfo } =
    useMaxFeeInfo(feeArgs);

  const gasFeeInfo = useMemo(() => {
    if (typeof feeInfo === 'bigint') {
      return feeInfo;
    }

    return undefined;
  }, [feeInfo]);

  const relayerFeeInfo = useMemo(() => {
    if (typeof feeInfo === 'object' && feeInfo != null) {
      return feeInfo;
    }

    return undefined;
  }, [feeInfo]);

  const totalFeeWei = useMemo(() => {
    if (typeof gasFeeInfo === 'bigint') {
      return gasFeeInfo;
    }

    if (!relayerFeeInfo) {
      return;
    }

    return relayerFeeInfo.estimatedFee;
  }, [gasFeeInfo, relayerFeeInfo]);

  const totalFeeToken = useMemo(() => {
    if (activeRelayer) {
      return fungibleCfg?.symbol;
    }

    return srcChainCfg?.nativeCurrency.symbol;
  }, [activeRelayer, fungibleCfg?.symbol, srcChainCfg?.nativeCurrency.symbol]);

  // Side effect for auto fetching fee info
  // when all inputs are filled and valid
  useEffect(
    () => {
      if (!amount || !fungibleCfg) {
        return;
      }

      if (!recipient || recipientErrorMsg) {
        return;
      }

      fetchFeeInfo(activeRelayer);
    },
    // prettier-ignore
    [activeRelayer, amount, fetchFeeInfo, fungibleCfg, recipient, recipientErrorMsg]
  );

  return {
    gasFeeInfo,
    isLoading,
    totalFeeToken,
    totalFeeWei,
    resetMaxFeeInfo,
  };
}
