import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { getValidDatesToQuery } from '../../utils';

const getVolume24h = async (): Promise<number | undefined> => {
  const [dateNow, date24h] = getValidDatesToQuery();

  let volume24h: number | undefined;
  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        date24h,
        dateNow
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
