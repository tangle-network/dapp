import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvlByVAnchor, getDeposit24hByVAnchor } from './utils';
import { ACTIVE_SUBGRAPH_URLS, VANCHORS_MAP } from '../constants';
import {
  getValidDatesToQuery,
  getChangeRate,
  getEpochStart,
  getEpoch24H,
} from '../utils';

import { PoolType } from '../components/PoolTypeChip/types';

type PoolOverviewType = {
  name: string;
  fungibleTokenSymbol: string;
  type: PoolType;
  deposit24h: number | undefined;
  depositChangeRate: number | undefined;
  tvl: number | undefined;
  tvlChangeRate: number | undefined;
};

export default async function getPoolOverviewCardData(
  poolAddress: string
): Promise<PoolOverviewType> {
  const vanchor = VANCHORS_MAP[poolAddress];
  const [_, date24h, date48h] = getValidDatesToQuery();
  const epochStart = getEpochStart();
  const epoch24h = getEpoch24H();

  const tvl = await getTvlByVAnchor(poolAddress);
  const deposit24h = await getDeposit24hByVAnchor(poolAddress);

  let tvl24h: number | undefined;
  try {
    const latestTvlByChains = await Promise.all(
      ACTIVE_SUBGRAPH_URLS.map(async (subgraphUrl) => {
        const latestTvlByVAnchorByChain =
          await vAnchorClient.TotalValueLocked.GetVAnchorByChainLatestTVLInTimeRange(
            subgraphUrl,
            poolAddress,
            epochStart,
            epoch24h
          );
        return latestTvlByVAnchorByChain.totalValueLocked;
      })
    );

    tvl24h = latestTvlByChains.reduce(
      (total, latestTvlByChain) =>
        total + +formatEther(BigInt(latestTvlByChain ?? 0)),
      0
    );
  } catch {
    tvl24h = undefined;
  }

  const tvlChangeRate = getChangeRate(tvl, tvl24h);

  let deposit48h: number | undefined;
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        date48h,
        date24h
      );

    deposit48h = depositVAnchorByChainsData.reduce(
      (deposit, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositByChain, vAnchorDeposit) =>
            depositByChain + +formatEther(BigInt(vAnchorDeposit.deposit ?? 0)),
          0
        );
        return deposit + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    deposit48h = undefined;
  }

  const depositChangeRate = getChangeRate(deposit24h, deposit48h);

  return {
    name: vanchor.fungibleTokenName,
    fungibleTokenSymbol: vanchor.fungibleTokenSymbol,
    type: 'single',
    deposit24h,
    depositChangeRate,
    tvl,
    tvlChangeRate,
  };
}
