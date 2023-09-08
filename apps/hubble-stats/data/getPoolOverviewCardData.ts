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

export default async function getPoolOverviewCardData(
  poolAddress: string
): Promise<PoolOverviewType> {
  const vanchor = VANCHORS_MAP[poolAddress];
  const [dateNow, date24h, date48h] = getValidDatesToQuery();

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
    // tvl calculation for 24h is not correct at the moment
    tvlChangeRate: undefined,
  };
}
