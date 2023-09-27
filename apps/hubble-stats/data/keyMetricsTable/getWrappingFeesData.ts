import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import { MetricType } from '../../types';

export default async function getRelayerFeesData(): Promise<MetricType> {
  try {
    const fetchedWrappingFeesData =
      await vAnchorClient.WrappingFee.GetVAnchorsWrappingFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    const fees = fetchedWrappingFeesData?.reduce(
      (wrappingFeesTotal, vAnchorsByChain) => {
        const wrappingFeesVAnchorsByChain = vAnchorsByChain.reduce(
          (wrappingFeesTotalByChain, vAnchor) =>
            wrappingFeesTotalByChain +
            +formatEther(BigInt(vAnchor.wrappingFee ?? 0)),
          0
        );
        return wrappingFeesTotal + wrappingFeesVAnchorsByChain;
      },
      0
    );

    return { value: fees };
  } catch (error) {
    console.error('Error while fetching wrapping fee data', error);
  }

  return {};
}
