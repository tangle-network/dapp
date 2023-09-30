import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { MetricType } from '../../types';
import {
  getChangeRate,
  EPOCH_DAY_INTERVAL,
  getDateFromEpoch,
} from '../../utils';
import { getDeposit24hByVAnchor } from '../utils';

async function getDeposit48hByVAnchor(poolAddress: string, epochNow: number) {
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        getDateFromEpoch(epochNow - 2 * EPOCH_DAY_INTERVAL),
        getDateFromEpoch(epochNow - EPOCH_DAY_INTERVAL)
      );

    return depositVAnchorByChainsData.reduce((deposit, vAnchorsByChain) => {
      const depositVAnchorsByChain = vAnchorsByChain.reduce(
        (depositByChain, vAnchorDeposit) =>
          depositByChain + +formatEther(BigInt(vAnchorDeposit.deposit ?? 0)),
        0
      );
      return deposit + depositVAnchorsByChain;
    }, 0);
  } catch (error) {
    console.error('Error while fetching deposit 48h data', error);
  }

  return undefined;
}

export default async function getPoolInfoCardDepositData(
  poolAddress: string,
  epochNow: number
): Promise<MetricType> {
  const [deposit24h, deposit48h] = await Promise.all([
    getDeposit24hByVAnchor(poolAddress),
    getDeposit48hByVAnchor(poolAddress, epochNow),
  ] as const);

  const depositChangeRate = getChangeRate(deposit24h, deposit48h);

  return {
    value: deposit24h,
    changeRate: depositChangeRate,
  };
}
