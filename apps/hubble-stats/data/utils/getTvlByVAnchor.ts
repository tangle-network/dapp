import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { SubgraphUrlType } from '../../types';

const getTvlByVAnchor = async (
  vAnchorAddress: string,
  subgraphUrls: SubgraphUrlType[]
): Promise<number | undefined> => {
  let tvl: number | undefined;
  try {
    const tvlVAnchorByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChains(
        subgraphUrls,
        vAnchorAddress
      );

    tvl = tvlVAnchorByChainsData.reduce(
      (tvl, vAnchorByChain) =>
        tvl + +formatEther(BigInt(vAnchorByChain?.totalValueLocked ?? 0)),
      0
    );
  } catch {
    tvl = undefined;
  }

  return tvl;
};

export default getTvlByVAnchor;
