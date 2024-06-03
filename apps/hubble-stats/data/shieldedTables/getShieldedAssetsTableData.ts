import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { EPOCH_DAY_INTERVAL, getDateFromEpoch } from '../../utils';
import { getDepositInTimeRangeByVAnchor } from '../utils';
import { VANCHORS_MAP, VANCHOR_ADDRESSES } from '../../constants';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';
import { SubgraphUrlType } from '../../types';

const getWithdrawals24h = async (
  supportedSubgraphs: Array<SubgraphUrlType>,
  vAnchorAddress: string,
  tokenSymbol: string,
  epochNow: number,
) => {
  try {
    const withdrawalVAnchorsByChainsData =
      await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChainsAndByToken15MinsInterval(
        supportedSubgraphs,
        vAnchorAddress,
        tokenSymbol,
        getDateFromEpoch(epochNow - EPOCH_DAY_INTERVAL),
        getDateFromEpoch(epochNow),
      );

    return withdrawalVAnchorsByChainsData.reduce(
      (withdrawal, vAnchorsByChain) => {
        const withdrawalVAnchorsByChain = vAnchorsByChain.reduce(
          (withdrawalByChain, vAnchorWithdrawal) =>
            withdrawalByChain +
            +formatEther(BigInt(vAnchorWithdrawal.withdrawal ?? 0)),
          0,
        );
        return withdrawal + withdrawalVAnchorsByChain;
      },
      0,
    );
  } catch {
    return;
  }
};

const getAssetInfoFromVAnchor = async (
  vAnchorAddress: string,
  epochNow: number,
) => {
  const vanchor = VANCHORS_MAP[vAnchorAddress];
  const { fungibleTokenSymbol: tokenSymbol, supportedSubgraphs } = vanchor;

  const [deposits24h, withdrawals24h] = await Promise.all([
    getDepositInTimeRangeByVAnchor(
      vAnchorAddress,
      epochNow - EPOCH_DAY_INTERVAL,
      epochNow,
      supportedSubgraphs,
    ),
    getWithdrawals24h(
      supportedSubgraphs,
      vAnchorAddress,
      tokenSymbol,
      epochNow,
    ),
  ]);

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
  epochNow: number,
): Promise<ShieldedAssetType[]> {
  return await Promise.all(
    VANCHOR_ADDRESSES.map((vanchor) =>
      getAssetInfoFromVAnchor(vanchor, epochNow),
    ),
  );
}
