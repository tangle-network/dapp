import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { getDateFromEpoch } from '../../utils';

export default async function getDepositInTimeRangeByVAnchor(
  vAnchorAddress: string,
  epochStart: number,
  epochEnd: number
) {
  let deposit: number | undefined;
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        getDateFromEpoch(epochStart),
        getDateFromEpoch(epochEnd)
      );

    deposit = depositVAnchorByChainsData.reduce((deposit, vAnchorsByChain) => {
      const depositVAnchorsByChain = vAnchorsByChain.reduce(
        (depositByChain, vAnchorDeposit) =>
          depositByChain + +formatEther(BigInt(vAnchorDeposit.deposit ?? 0)),
        0
      );
      return deposit + depositVAnchorsByChain;
    }, 0);
  } catch {
    deposit = undefined;
  }

  return deposit;
}
