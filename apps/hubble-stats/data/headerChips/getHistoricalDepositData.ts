import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';

export default async function getHistoricalDepositData() {
  let deposit: number | undefined;

  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
      );

    deposit = depositVAnchorsByChainsData?.reduce(
      (depositTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositTotalByChain, vAnchorDeposit) =>
            depositTotalByChain + +formatEther(BigInt(vAnchorDeposit ?? 0)),
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
