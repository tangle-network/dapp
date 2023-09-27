import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvlByVAnchor, getDeposit24hByVAnchor } from './utils';
import { getValidDatesToQuery } from '../utils';
import {
  ACTIVE_SUBGRAPH_URLS,
  VANCHORS_MAP,
  VANCHOR_ADDRESSES,
} from '../constants';
import { ShieldedAssetType } from '../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../components/ShieldedPoolsTable/types';

type ShieldedTablesDataType = {
  assetsData: ShieldedAssetType[];
  poolsData: ShieldedPoolType[];
};

const getAssetInfoFromVAnchor = async (vAnchorAddress: string) => {
  const vanchor = VANCHORS_MAP[vAnchorAddress];
  const tokenSymbol = vanchor.fungibleTokenSymbol;

  const [dateNow, date24h] = getValidDatesToQuery();

  let deposits24h: number | undefined;
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChainsAndByToken15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        tokenSymbol,
        date24h,
        dateNow
      );

    deposits24h = depositVAnchorsByChainsData.reduce(
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
    deposits24h = undefined;
  }

  let withdrawals24h: number | undefined;
  try {
    const withdrawalVAnchorsByChainsData =
      await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChainsAndByToken15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        tokenSymbol,
        date24h,
        dateNow
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

const getPoolInfoFromVAnchor = async (vAnchorAddress: string) => {
  const vanchor = VANCHORS_MAP[vAnchorAddress];

  // plus one for fungible token
  const tokenNum = vanchor.composition.length + 1;

  const deposits24h = await getDeposit24hByVAnchor(vAnchorAddress);
  const tvl = await getTvlByVAnchor(vAnchorAddress);

  return {
    address: vAnchorAddress,
    symbol: vanchor.fungibleTokenName,
    poolType: vanchor.poolType,
    token: tokenNum,
    deposits24h,
    tvl,
    currency: vanchor.fungibleTokenSymbol,
    typedChainIds: vanchor.supportedChains,
  };
};

export default async function getShieldedTablesData(): Promise<ShieldedTablesDataType> {
  const assetsData = await Promise.all(
    VANCHOR_ADDRESSES.map((vanchor) => getAssetInfoFromVAnchor(vanchor))
  );
  const poolsData = await Promise.all(
    VANCHOR_ADDRESSES.map((vanchor) => getPoolInfoFromVAnchor(vanchor))
  );
  return { assetsData, poolsData };
}
