import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { vAnchorAddresses, allSubgraphUrls } from '../constants';

type OverviewChipsDataType = {
  tvl: number;
  volume: number;
};

export default async function getOverviewChipsData(): Promise<OverviewChipsDataType> {
  const tvlVAnchorsByChainsData =
    await vAnchorClient.TotalValueLocked.GetVAnchorsTotalValueLockedByChains(
      allSubgraphUrls,
      vAnchorAddresses
    );

  const depositVAnchorsByChainsData =
    await vAnchorClient.Deposit.GetVAnchorsDepositByChains(
      allSubgraphUrls,
      vAnchorAddresses
    );

  const tvl = tvlVAnchorsByChainsData.reduce((tvlTotal, vAnchorsByChain) => {
    const tvlVAnchorsByChain = vAnchorsByChain.reduce(
      (tvlTotalByChain, vAnchor) =>
        tvlTotalByChain + +formatEther(BigInt(vAnchor.totalValueLocked)),
      0
    );
    return tvlTotal + tvlVAnchorsByChain;
  }, 0);

  const volume = depositVAnchorsByChainsData.reduce(
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

  return {
    tvl,
    volume,
  };
}
