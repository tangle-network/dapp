import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AMOUNT_KEY,
  HAS_REFUND_KEY,
  POOL_KEY,
  RECIPIENT_KEY,
  REFUND_RECIPIENT_KEY,
  SOURCE_CHAIN_KEY,
} from '../../../../../constants';
import { useMaxFeeInfo } from '../../../../../hooks/useMaxFeeInfo';
import { formatEther, parseEther } from 'viem';
import { numberToString } from '@webb-tools/webb-ui-components';

export type UseFeeCalculationArgs = {
  activeRelayer?: OptionalActiveRelayer;
  refundRecipientError?: string;
  recipientErrorMsg?: string;
};

export default function useFeeCalculation(args: UseFeeCalculationArgs) {
  const { activeRelayer, refundRecipientError, recipientErrorMsg } = args;

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

  const [hasRefund, refundRecipient] = useMemo(() => {
    return [
      !!searchParams.get(HAS_REFUND_KEY),
      searchParams.get(REFUND_RECIPIENT_KEY),
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

  const refundAmount = useMemo(() => {
    if (!relayerFeeInfo) {
      return;
    }

    return relayerFeeInfo.maxRefund;
  }, [relayerFeeInfo]);

  const totalFeeWei = useMemo(() => {
    if (typeof gasFeeInfo === 'bigint') {
      return gasFeeInfo;
    }

    if (!relayerFeeInfo) {
      return;
    }

    let total = relayerFeeInfo.estimatedFee;
    if (hasRefund && refundAmount) {
      const parsedRefund = parseFloat(formatEther(refundAmount));
      const parsedExchangeRate = parseFloat(
        formatEther(relayerFeeInfo.refundExchangeRate)
      );

      const refundCost = parsedRefund * parsedExchangeRate;
      total += parseEther(numberToString(refundCost));
    }

    return total;
  }, [gasFeeInfo, hasRefund, refundAmount, relayerFeeInfo]);

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

      // If refund is enabled, refund recipient must be filled and valid
      if (hasRefund && (!refundRecipient || refundRecipientError)) {
        return;
      }

      fetchFeeInfo(hasRefund ? activeRelayer : undefined);
    },
    // prettier-ignore
    [activeRelayer, amount, fetchFeeInfo, fungibleCfg, hasRefund, recipient, recipientErrorMsg, refundRecipient, refundRecipientError]
  );

  return {
    gasFeeInfo,
    isLoading,
    refundAmount,
    resetMaxFeeInfo,
    totalFeeToken,
    totalFeeWei,
  };
}
