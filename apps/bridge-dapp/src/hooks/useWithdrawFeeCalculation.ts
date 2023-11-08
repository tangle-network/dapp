import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { useEffect, useMemo } from 'react';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import { formatEther, parseEther } from 'viem';
import { AMOUNT_KEY, HAS_REFUND_KEY, RECIPIENT_KEY } from '../constants';
import useCurrenciesFromRoute from './useCurrenciesFromRoute';
import { MaxFeeInfoOption, useMaxFeeInfo } from './useMaxFeeInfo';

export default function useWithdrawFeeCalculation(args: {
  activeRelayer?: OptionalActiveRelayer;
  recipientErrorMsg?: string;
  typedChainId?: number | null;
}) {
  const { activeRelayer, recipientErrorMsg, typedChainId } = args;

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [HAS_REFUND_KEY]: BooleanParam,
    [RECIPIENT_KEY]: StringParam,
  });

  const {
    [AMOUNT_KEY]: amount,
    [HAS_REFUND_KEY]: hasRefund,
    [RECIPIENT_KEY]: recipient,
  } = query;

  const chain = useMemo(() => {
    if (typeof typedChainId === 'number') {
      return chainsPopulated[typedChainId];
    }
  }, [typedChainId]);

  const { activeApi, apiConfig } = useWebContext();

  const { fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();

  const feeArgs = useMemo(
    () =>
      ({
        fungibleCurrencyId: fungibleCfg?.id,
        typedChainId:
          typeof typedChainId === 'number' ? typedChainId : undefined,
      } satisfies MaxFeeInfoOption),
    [fungibleCfg?.id, typedChainId]
  );

  const { isLoading, feeInfo, fetchFeeInfo, resetMaxFeeInfo } =
    useMaxFeeInfo(feeArgs);

  const gasFeeInfo = useMemo(() => {
    if (typeof feeInfo !== 'bigint') {
      return;
    }

    return feeInfo;
  }, [feeInfo]);

  const relayerFeeInfo = useMemo(() => {
    if (typeof feeInfo !== 'object' || feeInfo == null) {
      return;
    }

    return feeInfo;
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

    return chain?.nativeCurrency.symbol;
  }, [activeRelayer, chain?.nativeCurrency.symbol, fungibleCfg?.symbol]);

  const anchorId = useMemo(() => {
    if (typeof typedChainId !== 'number' || !fungibleCfg) {
      return;
    }

    return apiConfig.getAnchorIdentifier(fungibleCfg.id, typedChainId);
  }, [apiConfig, fungibleCfg, typedChainId]);

  const allInputFilled = useMemo(() => {
    return [amount, wrappableCfg, chain, recipient, !recipientErrorMsg].every(
      (item) => Boolean(item)
    );
  }, [amount, chain, recipient, recipientErrorMsg, wrappableCfg]);

  // Side effect for auto fetching fee info
  // when all inputs are filled and valid
  useEffect(
    () => {
      if (!allInputFilled) {
        return;
      }

      if (typeof typedChainId !== 'number' || !anchorId) {
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
    [activeApi?.relayerManager, activeRelayer, allInputFilled, anchorId, fetchFeeInfo, hasRefund, typedChainId]
  );

  return {
    gasFeeInfo,
    isLoading,
    relayerFeeInfo,
    refundAmount,
    resetMaxFeeInfo,
    totalFeeToken,
    totalFeeWei,
  };
}
