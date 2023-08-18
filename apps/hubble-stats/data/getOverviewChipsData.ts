import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { vAnchorAddresses, availableSubgraphUrls } from '../constants';

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
        availableSubgraphUrls,
        vAnchorAddresses
      );

    tvl = tvlVAnchorsByChainsData?.reduce((tvlTotal, vAnchorsByChain) => {
      const tvlVAnchorsByChain = vAnchorsByChain.reduce(
        (tvlTotalByChain, vAnchor) =>
          tvlTotalByChain + +formatEther(BigInt(vAnchor.totalValueLocked ?? 0)),
        0
      );
      return tvlTotal + tvlVAnchorsByChain;
    }, 0);
  } catch {
    tvl = undefined;
  }

  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains(
        availableSubgraphUrls,
        vAnchorAddresses
      );

    volume = volumeVAnchorsByChainsData?.reduce(
      (volumeTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (volumeTotalByChain, vAnchor) =>
            volumeTotalByChain + +formatEther(BigInt(vAnchor.volume ?? 0)),
          0
        );
        return volumeTotal + depositVAnchorsByChain;
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
