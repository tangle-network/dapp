import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { vAnchorAddresses, availableSubgraphUrls } from '../../constants';
import { getDateFromEpoch, getEpochFromDate } from '../../utils';

const getVolume24h = async (): Promise<number | undefined> => {
  let volume24h: number | undefined;
  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains15MinsInterval(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(getEpochFromDate(new Date()) - 24 * 60 * 60),
        getDateFromEpoch(getEpochFromDate(new Date()))
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
