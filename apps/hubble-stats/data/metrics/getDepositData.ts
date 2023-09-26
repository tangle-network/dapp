import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import type { MetricType } from '../../types';
import { getValidDatesToQuery } from '../../utils/date';
import getChangeRate from '../../utils/getChangeRate';
import { getDeposit24h } from '../reusable';

async function getDeposit48h(date24h: Date, date48h: Date) {
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        date48h,
        date24h
      );

    return depositVAnchorsByChainsData?.reduce(
      (depositTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositTotalByChain, vAnchor) =>
            depositTotalByChain + +formatEther(BigInt(vAnchor.deposit ?? 0)),
          0
        );
        return depositTotal + depositVAnchorsByChain;
      },
      0
    );
  } catch (error) {
    console.error('Error while fetching deposit 48h data', error);
  }
}

export default async function getDepositData(): Promise<MetricType> {
  const [, date24h, date48h] = getValidDatesToQuery();

  const [deposit24h, deposit48h] = await Promise.all([
    getDeposit24h(),
    getDeposit48h(date24h, date48h),
  ] as const);

  const depositChangeRate = getChangeRate(deposit24h, deposit48h);

  return {
    value: deposit24h,
    changeRate: depositChangeRate,
  };
}
