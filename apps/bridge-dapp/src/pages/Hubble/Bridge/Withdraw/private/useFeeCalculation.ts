import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  DEST_CHAIN_KEY,
  HAS_REFUND_KEY,
  POOL_KEY,
  RECIPIENT_KEY,
  TOKEN_KEY,
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

  const [amount, poolId, tokenId, destChainId] = useMemo(() => {
    return [
      searchParams.get(AMOUNT_KEY),
      searchParams.get(POOL_KEY),
      searchParams.get(TOKEN_KEY),
      searchParams.get(DEST_CHAIN_KEY),
    ];
  }, [searchParams]);

  const [hasRefund, recipient] = useMemo(
    () => [searchParams.get(HAS_REFUND_KEY), searchParams.get(RECIPIENT_KEY)],
    [searchParams]
  );

  const fungibleCfg = useMemo(() => {
    if (poolId) {
      return apiConfig.currencies[parseInt(poolId)];
    }
  }, [apiConfig.currencies, poolId]);

  const destChainCfg = useMemo(() => {
    if (destChainId) {
      return apiConfig.chains[parseInt(destChainId)];
    }
  }, [apiConfig.chains, destChainId]);

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

    return destChainCfg?.nativeCurrency.symbol;
  }, [activeRelayer, destChainCfg?.nativeCurrency.symbol, fungibleCfg?.symbol]);

  // Side effect for auto fetching fee info
  // when all inputs are filled and valid
  useEffect(() => {
    if (!amount || !fungibleCfg || !tokenId) {
      return;
    }

    if (!destChainCfg || !recipient || recipientErrorMsg) {
      return;
    }

    fetchFeeInfo(activeRelayer);
  }, [activeRelayer, amount, destChainCfg, fetchFeeInfo, fungibleCfg, recipient, recipientErrorMsg, tokenId]) // prettier-ignore

  return {
    gasFeeInfo,
    isLoading,
    refundAmount,
    resetMaxFeeInfo,
    totalFeeToken,
    totalFeeWei,
  };
}
