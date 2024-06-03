import { useState, useEffect, useMemo } from 'react';
import { useQueryParams, NumberParam, StringParam } from 'use-query-params';
import { parseEther, formatEther } from 'viem';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { notificationApi } from '@webb-tools/webb-ui-components';
import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { ensureHex } from '@webb-tools/dapp-config';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import numberToString from '@webb-tools/webb-ui-components/utils/numberToString';
import { GasStationFill } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import type {
  FeeDetailsProps,
  FeeItem,
} from '@webb-tools/webb-ui-components/components/FeeDetails/types';

import { getEstimatedGasFeesByChain } from '../../../../../utils';
import { AMOUNT_KEY, SOURCE_CHAIN_KEY } from '../../../../../constants';

export default function useWrapFeeDetailsProps({
  balance,
  fungibleCfg,
  wrappableCfg,
}: {
  balance?: number;
  fungibleCfg?: CurrencyConfig;
  wrappableCfg?: CurrencyConfig;
}) {
  const [gasFees, setGasFees] = useState<number | undefined>();
  const [isLoadingGasFees, setIsLoadingGasFees] = useState(false);
  const [wrappingFees, setWrappingFees] = useState<number | undefined>();
  const [isLoadingWrappingFees, setIsLoadingWrappingFees] = useState(false);
  const [wrappingFeesPercentage, setWrappingFeesPercentage] = useState<
    number | undefined
  >();

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

  const client = useMemo(
    () => (srcTypedId ? getViemClient(srcTypedId) : undefined),
    [srcTypedId],
  );

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

  const wrappingFeeDetailProps = useMemo<FeeItem>(
    () => {
      return {
        name:
          wrappingFeesPercentage !== undefined
            ? `Wrapping Fee (${wrappingFeesPercentage}%)`
            : 'Wrapping Fee',
        info: 'Fees required to wrap the token.',
        value: wrappingFees,
        isLoading: isLoadingWrappingFees,
        tokenSymbol: wrappableCfg?.symbol,
      };
    },
    // prettier-ignore
    [wrappingFeesPercentage, wrappingFees, isLoadingWrappingFees, wrappableCfg],
  );

  const totalFeeCmp = useMemo(() => {
    if (gasFees === undefined && wrappingFees === undefined) return undefined;
    if (
      typeof gasFeeDetailProps.tokenSymbol === 'string' &&
      typeof wrappingFeeDetailProps.tokenSymbol === 'string' &&
      gasFeeDetailProps.tokenSymbol === wrappingFeeDetailProps.tokenSymbol
    ) {
      return (
        <Typography variant="body1" fw="bold">
          {numberToString((gasFees ?? 0) + (wrappingFees ?? 0)).slice(0, 10)}{' '}
          {gasFeeDetailProps.tokenSymbol}
        </Typography>
      );
    }
    return (
      <Typography variant="body1" fw="bold">
        {typeof gasFees === 'number' &&
        typeof gasFeeDetailProps.tokenSymbol === 'string'
          ? `${numberToString(gasFees).slice(0, 10)} ${
              gasFeeDetailProps.tokenSymbol
            }`
          : '--'}{' '}
        +{' '}
        {typeof wrappingFees === 'number' &&
        typeof wrappingFeeDetailProps.tokenSymbol === 'string'
          ? `${numberToString(wrappingFees).slice(0, 10)} ${
              wrappingFeeDetailProps.tokenSymbol
            }`
          : '--'}
      </Typography>
    );
  }, [gasFees, wrappingFees, gasFeeDetailProps, wrappingFeeDetailProps]);

  useEffect(
    () => {
      const updateWrappingFees = async () => {
        if (
          !client ||
          !isValidAmount ||
          !srcTypedId ||
          !fungibleCfg ||
          typeof amount !== 'string' ||
          amount.length === 0
        )
          return;
        const fungibleContractAddr = fungibleCfg.addresses.get(srcTypedId);

        if (!fungibleContractAddr) return;

        const fungibleContractHex = ensureHex(fungibleContractAddr);

        try {
          setIsLoadingWrappingFees(true);

          const wrappingFeesPromise = client.readContract({
            address: fungibleContractHex,
            abi: FungibleTokenWrapper__factory.abi,
            functionName: 'getFeeFromAmount',
            args: [BigInt(amount)],
          });
          const wrappingFeesPercentagePromise = client.readContract({
            address: fungibleContractHex,
            abi: FungibleTokenWrapper__factory.abi,
            functionName: 'feePercentage',
          });

          const [wrappingFees, wrappingFeesPercentage] = await Promise.all([
            wrappingFeesPromise,
            wrappingFeesPercentagePromise,
          ]);

          setWrappingFees(parseFloat(formatEther(wrappingFees)));
          setWrappingFeesPercentage(wrappingFeesPercentage);
        } catch {
          notificationApi.addToQueue({
            variant: 'error',
            message: 'Failed to get wrapping fees',
          });
        } finally {
          setIsLoadingWrappingFees(false);
        }
      };

      updateWrappingFees();
    },
    // prettier-ignore
    [client, isValidAmount, srcTypedId, fungibleCfg, amount, srcChainCfg],
  );

  useEffect(() => {
    const updateGasFees = async () => {
      if (!srcTypedId || BigInt(amount ?? 0) === ZERO_BIG_INT) return;
      try {
        setIsLoadingGasFees(true);
        const estimatedGasFees = await getEstimatedGasFeesByChain(srcTypedId);
        setGasFees(parseFloat(formatEther(estimatedGasFees)));
      } catch {
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
      setWrappingFees(undefined);
      return;
    }
  }, [isValidAmount]);

  return {
    items: [gasFeeDetailProps, wrappingFeeDetailProps],
    isTotalLoading: isLoadingGasFees || isLoadingWrappingFees,
    totalFeeCmp,
  } satisfies FeeDetailsProps;
}
