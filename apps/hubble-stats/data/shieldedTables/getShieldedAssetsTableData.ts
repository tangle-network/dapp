import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { EPOCH_DAY_INTERVAL, getDateFromEpoch } from '../../utils';
import { getDepositInTimeRangeByVAnchor } from '../utils';
import { VANCHORS_MAP, VANCHOR_ADDRESSES } from '../../constants';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';

const getAssetInfoFromVAnchor = async (
  vAnchorAddress: string,
  epochNow: number
) => {
  const vanchor = VANCHORS_MAP[vAnchorAddress];
  const { fungibleTokenSymbol: tokenSymbol, supportedSubgraphs } = vanchor;

  const deposits24h = await getDepositInTimeRangeByVAnchor(
    vAnchorAddress,
    epochNow - EPOCH_DAY_INTERVAL,
    epochNow,
    supportedSubgraphs
  );

  let withdrawals24h: number | undefined;
  try {
    const withdrawalVAnchorsByChainsData =
      await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChainsAndByToken15MinsInterval(
        supportedSubgraphs,
        vAnchorAddress,
        tokenSymbol,
        getDateFromEpoch(epochNow - EPOCH_DAY_INTERVAL),
        getDateFromEpoch(epochNow)
      );

    withdrawals24h = withdrawalVAnchorsByChainsData.reduce(
      (withdrawal, vAnchorsByChain) => {
        const withdrawalVAnchorsByChain = vAnchorsByChain.reduce(
          (withdrawalByChain, vAnchorWithdrawal) =>
            withdrawalByChain +
            +formatEther(BigInt(vAnchorWithdrawal.withdrawal ?? 0)),
          0
        );
        return withdrawal + withdrawalVAnchorsByChain;
      },
      0
    );
  } catch {
    withdrawals24h = undefined;
  }

  return {
    address: vanchor.fungibleTokenAddress,
    poolAddress: vAnchorAddress,
    symbol: vanchor.fungibleTokenSymbol,
    url: undefined,
    poolType: vanchor.poolType,
    composition: vanchor.composition,
    deposits24h,
    withdrawals24h,
    typedChainIds: vanchor.supportedChains,
  };
};

export default async function getShieldedAssetsTableData(
  epochNow: number
): Promise<ShieldedAssetType[]> {
  return await Promise.all(
    VANCHOR_ADDRESSES.map((vanchor) =>
      getAssetInfoFromVAnchor(vanchor, epochNow)
    )
  );
}
