import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl } from './reusable';
import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../constants';

type OverviewChipsDataType = {
  tvl: number | undefined;
  deposit: number | undefined;
};

export default async function getOverviewChipsData(): Promise<OverviewChipsDataType> {
  const tvl = await getTvl();

  let deposit: number | undefined;

  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    deposit = depositVAnchorsByChainsData?.reduce(
      (depositTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositTotalByChain, vAnchorDeposit) =>
            depositTotalByChain + +formatEther(BigInt(vAnchorDeposit ?? 0)),
          0
        );
        return depositTotal + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    deposit = undefined;
  }

  return {
    tvl,
    deposit,
  };
}
