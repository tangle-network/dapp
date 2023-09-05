import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS, VANCHORS_MAP } from '../constants';
import { getValidDatesToQuery } from '../utils';

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

export default async function getPoolOverviewData(
  poolAddress: string
): Promise<PoolOverviewType> {
  const vanchor = VANCHORS_MAP[poolAddress];
  const [dateNow, date24h, date48h] = getValidDatesToQuery();

  let deposit24h: number | undefined;
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        date24h,
        dateNow
      );

    deposit24h = depositVAnchorByChainsData.reduce(
      (depositTotal, vAnchorByChain) =>
        depositTotal + +formatEther(BigInt(vAnchorByChain?.deposit ?? 0)),
      0
    );
  } catch {
    deposit24h = undefined;
  }

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
      (depositTotal, vAnchorByChain) =>
        depositTotal + +formatEther(BigInt(vAnchorByChain?.deposit ?? 0)),
      0
    );
  } catch {
    deposit48h = undefined;
  }

  let tvl: number | undefined;
  try {
    const tvlVAnchorByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChains(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress
      );

    tvl = tvlVAnchorByChainsData.reduce(
      (tvl, vAnchorByChain) =>
        tvl + +formatEther(BigInt(vAnchorByChain?.totalValueLocked ?? 0)),
      0
    );
  } catch {
    tvl = undefined;
  }

  let tvl24h: number | undefined;
  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        date48h,
        date24h
      );

    tvl24h = tvlVAnchorsByChainsData.reduce((tvlTotal, vAnchorsByChain) => {
      if (!vAnchorsByChain) return tvlTotal;
      return (
        tvlTotal + +formatEther(BigInt(vAnchorsByChain.totalValueLocked ?? 0))
      );
    }, 0);
  } catch {
    tvl24h = undefined;
  }

  // follow Uniswap's formula
  // https://github.com/Uniswap/v3-info/blob/master/src/data/protocol/overview.ts#L95
  const tvlChangeRate =
    tvl && tvl24h ? ((tvl - tvl24h) / tvl24h) * 100 : undefined;

  const depositChangeRate =
    deposit24h && deposit48h
      ? ((deposit24h - deposit48h) / deposit48h) * 100
      : undefined;

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
