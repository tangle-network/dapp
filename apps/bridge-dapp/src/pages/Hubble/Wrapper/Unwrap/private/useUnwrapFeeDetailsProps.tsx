import { useState, useEffect, useMemo } from 'react';
import { useQueryParams, NumberParam, StringParam } from 'use-query-params';
import { parseEther, formatEther } from 'viem';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { notificationApi } from '@webb-tools/webb-ui-components';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { GasStationFill } from '@webb-tools/icons';
import type {
  FeeDetailsProps,
  FeeItem,
} from '@webb-tools/webb-ui-components/src/components/FeeDetails/types';

import { getEstimatedGasFeesByChain } from '../../../../../utils';
import { AMOUNT_KEY, SOURCE_CHAIN_KEY } from '../../../../../constants';

export default function useUnwrapFeeDetailsProps({
  balance,
}: {
  balance?: number;
}) {
  const [gasFees, setGasFees] = useState<number | undefined>();
  const [isLoadingGasFees, setIsLoadingGasFees] = useState(false);

  const { apiConfig } = useWebContext();

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [SOURCE_CHAIN_KEY]: NumberParam,
  });

  const { [AMOUNT_KEY]: amount, [SOURCE_CHAIN_KEY]: srcTypedId } = query;

  const srcChainCfg = useMemo(() => {
    if (typeof srcTypedId !== 'number') {
      return;
    }

    return apiConfig.chains[srcTypedId];
  }, [apiConfig.chains, srcTypedId]);

  const isValidAmount = useMemo(() => {
    if (typeof amount !== 'string' || amount.length === 0) {
      return false;
    }

    const amountBI = BigInt(amount);

    // If balance is not a number, but amount is entered and > 0,
    // it means user not connected to wallet but entered amount
    // so we allow it
    if (typeof balance !== 'number' && amountBI > 0) {
      return true;
    }

    if (!balance || amountBI <= 0) {
      return false;
    }

    const parsedBalance = parseEther(numberToString(balance));

    return amountBI !== ZERO_BIG_INT && amountBI <= parsedBalance;
  }, [amount, balance]);

  const gasFeeDetailProps = useMemo<FeeItem>(() => {
    return {
      name: 'Gas',
      Icon: <GasStationFill />,
      info: 'Fees required to execute the wrapping transaction.',
      value: gasFees,
      isLoading: isLoadingGasFees,
      tokenSymbol: srcChainCfg?.nativeCurrency.symbol,
    };
  }, [gasFees, isLoadingGasFees, srcChainCfg]);

  useEffect(() => {
    const updateGasFees = async () => {
      if (!srcTypedId || BigInt(amount ?? 0) === ZERO_BIG_INT) return;
      try {
        setIsLoadingGasFees(true);
        const estimatedGasFees = await getEstimatedGasFeesByChain(srcTypedId);
        setGasFees(parseFloat(formatEther(estimatedGasFees)));
      } catch (error) {
        notificationApi.addToQueue({
          variant: 'error',
          message: 'Failed to estimate gas fees',
        });
      } finally {
        setIsLoadingGasFees(false);
      }
    };

    updateGasFees();
  }, [srcTypedId, amount]);

  useEffect(() => {
    if (!isValidAmount) {
      setGasFees(undefined);
      return;
    }
  }, [isValidAmount]);

  return {
    items: [gasFeeDetailProps],
    totalFee: gasFees,
    totalFeeToken: gasFeeDetailProps.tokenSymbol,
    isTotalLoading: isLoadingGasFees,
  } satisfies FeeDetailsProps;
}
