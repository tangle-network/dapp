'use client';

import ensureHex from '@webb-tools/dapp-config/utils/ensureHex';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

import { evmClient } from '../../constants';
import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useTokenWalletBalance(
  address: string,
  defaultValue: { value1: number | null } = { value1: null }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!address || address === '0x0') {
        setValue1(null);
        setIsLoading(false);
        return;
      }

      try {
        const balance = await evmClient.getBalance({
          address: ensureHex(address),
        });

        const walletBalance = formatEther(balance);

        setValue1(Number(walletBalance));
        setIsLoading(false);
      } catch (e) {
        setError(
          e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, [address]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
