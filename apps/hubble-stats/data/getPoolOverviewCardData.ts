import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvlByVAnchor, getDeposit24hByVAnchor } from './reusable';
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

  const tvl = await getTvlByVAnchor(poolAddress);
  const deposit24h = await getDeposit24hByVAnchor(poolAddress);

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
