import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { getValidDatesToQuery } from '../../utils';

const getDeposit24hAllChainsByVAnchor = async (
  vAnchorAddress: string
): Promise<number | undefined> => {
  const [dateNow, date24h] = getValidDatesToQuery();

  let deposit24h: number | undefined;
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        date24h,
        dateNow
      );

    deposit24h = depositVAnchorByChainsData.reduce(
      (deposit, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositByChain, vAnchorDeposit) =>
            depositByChain + +formatEther(BigInt(vAnchorDeposit.deposit ?? 0)),
          0
        );
        return deposit + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    deposit24h = undefined;
  }

  return deposit24h;
};

export default getDeposit24hAllChainsByVAnchor;
