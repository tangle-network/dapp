import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../../constants';

const getTvl = async (): Promise<number | undefined> => {
  let tvl: number | undefined;
  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTotalValueLockedByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
      );

    tvl = tvlVAnchorsByChainsData?.reduce((tvlTotal, vAnchorsByChain) => {
      const tvlVAnchorsByChain = vAnchorsByChain.reduce(
        (tvlTotalByChain, vAnchor) =>
          tvlTotalByChain + +formatEther(BigInt(vAnchor.totalValueLocked ?? 0)),
        0,
      );
      return tvlTotal + tvlVAnchorsByChain;
    }, 0);
  } catch {
    tvl = undefined;
  }

  return tvl;
};

export default getTvl;
