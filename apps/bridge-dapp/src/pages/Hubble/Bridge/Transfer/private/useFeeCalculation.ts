import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { numberToString } from '@webb-tools/webb-ui-components';
import { useEffect, useMemo } from 'react';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  HAS_REFUND_KEY,
  RECIPIENT_KEY,
  REFUND_RECIPIENT_KEY,
} from '../../../../../constants';
import useChainsFromRoute from '../../../../../hooks/useChainsFromRoute';
import useCurrenciesFromRoute from '../../../../../hooks/useCurrenciesFromRoute';
import {
  useMaxFeeInfo,
  type MaxFeeInfoOption,
} from '../../../../../hooks/useMaxFeeInfo';

export default function useFeeCalculation(args: {
  typedChainId?: number | null;
  activeRelayer?: OptionalActiveRelayer;
  refundRecipientError?: string;
  recipientErrorMsg?: string;
}) {
  const {
    activeRelayer,
    refundRecipientError,
    recipientErrorMsg,
    typedChainId,
  } = args;

  const { activeApi, apiConfig } = useWebContext();

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [RECIPIENT_KEY]: StringParam,
    [HAS_REFUND_KEY]: BooleanParam,
    [REFUND_RECIPIENT_KEY]: StringParam,
  });

  const {
    [AMOUNT_KEY]: amount,
    [HAS_REFUND_KEY]: hasRefund,
    [REFUND_RECIPIENT_KEY]: refundRecipient,
    [RECIPIENT_KEY]: recipient,
  } = query;

  const { srcChainCfg, srcTypedChainId } = useChainsFromRoute();
  const { fungibleCfg } = useCurrenciesFromRoute();

  const feeArgs = useMemo(
    () =>
      ({
        fungibleCurrencyId: fungibleCfg?.id,
        typedChainId:
          typeof srcTypedChainId === 'number' ? srcTypedChainId : undefined,
      } satisfies MaxFeeInfoOption),
    [fungibleCfg?.id, srcTypedChainId]
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

  const anchorId = useMemo(() => {
    if (typeof typedChainId !== 'number' || !fungibleCfg) {
      return;
    }

    return apiConfig.getAnchorIdentifier(fungibleCfg.id, typedChainId);
  }, [apiConfig, fungibleCfg, typedChainId]);

  // Side effect for auto fetching fee info
  // when all inputs are filled and valid
  useEffect(
    () => {
      if (!amount || !anchorId || typeof typedChainId !== 'number') {
        return;
      }

      if (!recipient || recipientErrorMsg) {
        return;
      }

      // If refund is enabled, refund recipient must be filled and valid
      if (hasRefund && (!refundRecipient || refundRecipientError)) {
        return;
      }

      const hasSupport =
        activeRelayer &&
        activeApi?.relayerManager &&
        activeRelayer.isSupported(
          typedChainId,
          anchorId,
          activeApi.relayerManager.cmdKey
        );

      fetchFeeInfo(hasRefund && hasSupport ? activeRelayer : undefined);
    },
    // prettier-ignore
    [activeApi?.relayerManager, activeRelayer, amount, anchorId, fetchFeeInfo, hasRefund, recipient, recipientErrorMsg, refundRecipient, refundRecipientError, typedChainId]
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
