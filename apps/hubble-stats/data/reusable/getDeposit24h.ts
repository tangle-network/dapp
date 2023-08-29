import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { getValidDatesToQuery } from '../../utils';

const getDeposit24h = async (): Promise<number | undefined> => {
  const [dateNow, date24h] = getValidDatesToQuery();

  let deposit24h: number | undefined;
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        date24h,
        dateNow
      );

    deposit24h = depositVAnchorsByChainsData?.reduce(
      (depositTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositTotalByChain, vAnchor) =>
            depositTotalByChain + +formatEther(BigInt(vAnchor.deposit ?? 0)),
          0
        );
        return depositTotal + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    deposit24h = undefined;
  }

  return deposit24h;
};

export default getDeposit24h;
