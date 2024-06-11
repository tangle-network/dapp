import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { getDateFromEpoch } from '../../utils';

export default async function getDepositInTimeRange(
  epochStart: number,
  epochEnd: number,
) {
  let deposit: number | undefined;
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        getDateFromEpoch(epochStart),
        getDateFromEpoch(epochEnd),
      );

    deposit = depositVAnchorsByChainsData?.reduce(
      (depositTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositTotalByChain, vAnchor) =>
            depositTotalByChain + +formatEther(BigInt(vAnchor.deposit ?? 0)),
          0,
        );
        return depositTotal + depositVAnchorsByChain;
      },
      0,
    );
  } catch {
    deposit = undefined;
  }

  return deposit;
}
