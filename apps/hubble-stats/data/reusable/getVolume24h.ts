import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import {
  VANCHOR_ADDRESSES,
  ACTIVE_SUBGRAPH_URLS,
  DATE_NOW,
  DATE_24H,
} from '../../constants';

const getVolume24h = async (): Promise<number | undefined> => {
  let volume24h: number | undefined;
  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        DATE_24H,
        DATE_NOW
      );

    volume24h = volumeVAnchorsByChainsData?.reduce(
      (volumeTotal, vAnchorsByChain) => {
        const volumeVAnchorsByChain = vAnchorsByChain.reduce(
          (volumeTotalByChain, vAnchor) =>
            volumeTotalByChain + +formatEther(BigInt(vAnchor.volume ?? 0)),
          0
        );
        return volumeTotal + volumeVAnchorsByChain;
      },
      0
    );
  } catch {
    volume24h = undefined;
  }

  return volume24h;
};

export default getVolume24h;
