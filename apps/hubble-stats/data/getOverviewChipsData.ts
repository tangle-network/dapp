import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { vAnchorAddresses, allSubgraphUrls } from '../constants';

type OverviewChipsDataType = {
  tvl: number | undefined;
  volume: number | undefined;
};

export default async function getOverviewChipsData(): Promise<OverviewChipsDataType> {
  let tvl: number | undefined;
  let volume: number | undefined;

  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTotalValueLockedByChains(
        allSubgraphUrls,
        vAnchorAddresses
      );

    tvl = tvlVAnchorsByChainsData?.reduce((tvlTotal, vAnchorsByChain) => {
      const tvlVAnchorsByChain = vAnchorsByChain.reduce(
        (tvlTotalByChain, vAnchor) =>
          tvlTotalByChain + +formatEther(BigInt(vAnchor.totalValueLocked)),
        0
      );
      return tvlTotal + tvlVAnchorsByChain;
    }, 0);
  } catch {
    tvl = undefined;
  }

  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains(
        allSubgraphUrls,
        vAnchorAddresses
      );

    volume = depositVAnchorsByChainsData?.reduce(
      (depositTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (tvlTotalByChain, vAnchor) =>
            tvlTotalByChain + +formatEther(BigInt(vAnchor.deposit)),
          0
        );
        return depositTotal + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    volume = undefined;
  }

  return {
    tvl,
    volume,
  };
}
