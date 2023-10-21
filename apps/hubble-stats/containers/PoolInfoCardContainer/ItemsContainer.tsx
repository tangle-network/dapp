'use client';

import useSWR from 'swr';
import { PoolOverviewCardItem } from '../../components/PoolInfoCardItem';
import { getPoolInfoCardDepositData, getPoolInfoCardTvlData } from '../../data';

export default function ItemsContainer(props: {
  symbol: string;
  poolAddress: string;
  epochStart: number;
  epochNow: number;
}) {
  const { symbol, epochNow, epochStart, poolAddress } = props;

  const { data: tvlData, isLoading: tvlDataLoading } = useSWR(
    'ItemsContainer-getPoolInfoCardTvlData',
    () => getPoolInfoCardTvlData(poolAddress, epochStart, epochNow)
  );

  const { data: depositData, isLoading: depositDataLoading } = useSWR(
    'ItemsContainer-getPoolInfoCardDepositData',
    () => getPoolInfoCardDepositData(poolAddress, epochNow)
  );

  return (
    <div className="grid grid-cols-2">
      <PoolOverviewCardItem
        isLoading={tvlDataLoading}
        value={tvlData}
        title="tvl"
        suffix={` ${symbol}`}
      />
      <PoolOverviewCardItem
        isLoading={depositDataLoading}
        value={depositData}
        title="Deposits 24H"
        suffix={` ${symbol}`}
        className="border-l border-mono-40 dark:border-mono-140"
      />
    </div>
  );
}
