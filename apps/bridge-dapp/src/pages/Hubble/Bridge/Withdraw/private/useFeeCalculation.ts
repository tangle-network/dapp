import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import {
  AMOUNT_KEY,
  DEST_CHAIN_KEY,
  HAS_REFUND_KEY,
  POOL_KEY,
  RECIPIENT_KEY,
  REFUND_AMOUNT_KEY,
  TOKEN_KEY,
} from '../../../../../constants';
import { useMaxFeeInfo } from '../../../../../hooks/useMaxFeeInfo';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';

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

  const [refundAmount, hasRefund, recipient] = useMemo(
    () => [
      searchParams.get(REFUND_AMOUNT_KEY),
      searchParams.get(HAS_REFUND_KEY),
      searchParams.get(RECIPIENT_KEY),
    ],
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

  const [refundAmountError, setRefundAmountError] = useState('');

  const feeArgs = useMemo(
    () => ({
      fungibleCurrencyId: fungibleCfg?.id,
    }),
    [fungibleCfg?.id]
  );

  const { isLoading, feeInfo, fetchFeeInfo } = useMaxFeeInfo(feeArgs);

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

    let total = relayerFeeInfo.estimatedFee;
    if (hasRefund && refundAmount) {
      const parsedRefund = parseFloat(formatEther(BigInt(refundAmount)));
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

  // Side effect for validating the refund amount with max refund from relayer
  useEffect(() => {
    if (!relayerFeeInfo || !refundAmount) {
      setRefundAmountError('');
      return;
    }

    const validate = () => {
      const max = relayerFeeInfo.maxRefund;
      const refundAmountBig = BigInt(refundAmount);
      if (refundAmountBig > max) {
        // Truncate the amount string to 6 decimal places
        const truncatedAmount = formatEther(max).slice(0, 10);
        setRefundAmountError(`Max refund is ${truncatedAmount}`);
      } else {
        setRefundAmountError('');
      }
    };

    const timeout = setTimeout(validate, 500);

    return () => clearTimeout(timeout);
  }, [relayerFeeInfo, refundAmount]);

  return {
    gasFeeInfo,
    isLoading,
    refundAmountError,
    totalFeeToken,
    totalFeeWei,
  };
}
