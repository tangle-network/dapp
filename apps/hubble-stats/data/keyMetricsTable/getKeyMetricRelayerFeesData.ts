import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import { MetricType } from '../../types';

export default async function getKeyMetricRelayerFeesData(): Promise<MetricType> {
  try {
    const fetchedRelayerFeesData =
      await vAnchorClient.RelayerFee.GetVAnchorsRelayerFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    const fees = fetchedRelayerFeesData.reduce(
      (relayerFeesTotal, vAnchorsByChain) => {
        const relayerFeesVAnchorsByChain = vAnchorsByChain.reduce(
          (relayerFeesTotalByChain, vAnchor) =>
            relayerFeesTotalByChain + +formatEther(BigInt(vAnchor.profit ?? 0)),
          0
        );
        return relayerFeesTotal + relayerFeesVAnchorsByChain;
      },
      0
    );

    return { value: fees };
  } catch (error) {
    console.error('Error while fetching relayer fee data', error);
  }

  return {};
}
