import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';

const getRelayerEarningsByVAnchor = async (
  vanchorAddress: string
): Promise<number | undefined> => {
  let relayerEarnings: number | undefined;
  try {
    const tvlVAnchorByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChains(
        ACTIVE_SUBGRAPH_URLS,
        vanchorAddress
      );

    relayerEarnings = tvlVAnchorByChainsData.reduce(
      (tvl, vAnchorByChain) =>
        tvl + +formatEther(BigInt(vAnchorByChain?.totalValueLocked ?? 0)),
      0
    );
  } catch {
    relayerEarnings = undefined;
  }

  return relayerEarnings;
};

export default getRelayerEarningsByVAnchor;
