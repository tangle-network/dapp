import { formatEther } from 'viem';

import { evmClient } from '../../constants';
import { StatsMetricReturnType } from '../../types';

export const getTokenWalletBalance = async (
  address: string
): Promise<StatsMetricReturnType> => {
  try {
    const balance = await evmClient.getBalance({
      address: address as `0x${string}`,
    });

    const walletBalance = formatEther(balance);

    return Number(walletBalance) ?? NaN;
  } catch (e) {
    console.error(e);

    return NaN;
  }
};
