import { randNumber, randFloat } from '@ngneat/falso';
import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { vAnchorAddresses, availableSubgraphUrls } from '../constants';

type KeyMetricDataType = {
  tvl: number;
  tvlChangeRate: number;
  volume: number;
  volumeChangeRate: number;
  relayerFees: number | undefined;
  wrappingFees: number | undefined;
};

export default async function getKeyMetricsData(): Promise<KeyMetricDataType> {
  let relayerFees: number | undefined;
  let wrappingFees: number | undefined;

  try {
    const relayerFeesVAnchorsByChainsData =
      await vAnchorClient.RelayerFee.GetVAnchorsTotalRelayerFeeByChains(
        availableSubgraphUrls,
        vAnchorAddresses
      );

    relayerFees = relayerFeesVAnchorsByChainsData?.reduce(
      (relayerFeesTotal, vAnchorsByChain) => {
        const relayerFeesVAnchorsByChain = vAnchorsByChain.reduce(
          (relayerFeesTotalByChain, vAnchor) =>
            relayerFeesTotalByChain +
            +formatEther(BigInt(vAnchor.totalRelayerFee ?? 0)),
          0
        );
        return relayerFeesTotal + relayerFeesVAnchorsByChain;
      },
      0
    );
  } catch {
    relayerFees = undefined;
  }

  try {
    const wrappingFeesVAnchorsByChainsData =
      await vAnchorClient.WrappingFee.GetVAnchorsTotalWrappingFeeByChains(
        availableSubgraphUrls,
        vAnchorAddresses
      );

    wrappingFees = wrappingFeesVAnchorsByChainsData?.reduce(
      (wrappingFeesTotal, vAnchorsByChain) => {
        const wrappingFeesVAnchorsByChain = vAnchorsByChain.reduce(
          (wrappingFeesTotalByChain, vAnchor) =>
            wrappingFeesTotalByChain +
            +formatEther(BigInt(vAnchor.totalWrappingFee ?? 0)),
          0
        );
        return wrappingFeesTotal + wrappingFeesVAnchorsByChain;
      },
      0
    );
  } catch {
    wrappingFees = undefined;
  }

  return {
    tvl: randNumber({ min: 1_000_000, max: 50_000_000 }),
    tvlChangeRate: randFloat({ min: -20, max: 20, fraction: 2 }),
    volume: randNumber({ min: 20_000_000, max: 99_999_999 }),
    volumeChangeRate: randFloat({ min: -20, max: 20, fraction: 2 }),
    relayerFees,
    wrappingFees,
  };
}
