import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl } from './reusable';
import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../constants';

type OverviewChipsDataType = {
  tvl: number | undefined;
  volume: number | undefined;
};

export default async function getOverviewChipsData(): Promise<OverviewChipsDataType> {
  const tvl = await getTvl();

  let volume: number | undefined;

  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
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
