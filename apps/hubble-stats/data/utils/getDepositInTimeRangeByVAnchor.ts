import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getDateFromEpoch } from '../../utils';
import { SubgraphUrlType } from '../../types';

export default async function getDepositInTimeRangeByVAnchor(
  vAnchorAddress: string,
  epochStart: number,
  epochEnd: number,
  subgraphUrls: SubgraphUrlType[]
) {
  let deposit: number | undefined;
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        subgraphUrls,
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
