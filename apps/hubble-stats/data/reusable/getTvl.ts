import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { vAnchorAddresses, availableSubgraphUrls } from '../../constants';

const getTvl = async (): Promise<number | undefined> => {
  let tvl: number | undefined;
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

  return tvl;
};

export default getTvl;
