import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';
import fetchAnchorMetadata from '@webb-tools/web3-api-provider/src/fetchAnchorMetadata';

import {
  V_ANCHORS,
  ACTIVE_SUBGRAPH_URLS,
  DATE_NOW,
  DATE_24H,
  VAnchorType,
} from '../constants';

import { ShieldedAssetType } from '../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../components/ShieldedPoolsTable/types';

type ShieldedTablesDataType = {
  assetsData: ShieldedAssetType[];
  poolsData: ShieldedPoolType[];
};

const tokens = [
  'dai',
  'eth',
  'usdc',
  'usdt',
  'moondev',
  'matic',
  'weth',
  'op',
  'arbitrum',
];

const getAssetInfoFromVAnchor = async (vanchor: VAnchorType) => {
  const tokenSymbol = vanchor.fungibleTokenSymbol;
  const vAnchorAddress = vanchor.address;

  const { wrappableCurrencies } = await fetchAnchorMetadata(
    vAnchorAddress,
    // currently the data for Orbit chains are the same
    vanchor.supportedChains[0]
  );

  let deposits24h: number | undefined;
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChainsAndByToken15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        tokenSymbol,
        DATE_24H,
        DATE_NOW
      );

    deposits24h = depositVAnchorsByChainsData?.reduce(
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

  let tvl: number | undefined;
  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChainsAndByTokenDayInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        tokenSymbol,
        DATE_24H,
        DATE_NOW
      );

    tvl = tvlVAnchorsByChainsData?.reduce((tvlTotal, vAnchorsByChain) => {
      const tvlVAnchorsByChain = vAnchorsByChain.reduce(
        (tvlTotalByChain, vAnchor) =>
          tvlTotalByChain + +formatEther(BigInt(vAnchor.totalValueLocked ?? 0)),
        0
      );
      return tvlTotal + tvlVAnchorsByChain;
    }, 0);
  } catch {
    tvl = undefined;
  }

  return {
    address: vanchor.fungibleTokenAddress,
    // TO UPDATE
    symbol: vanchor.fungibleTokenSymbol,
    url: undefined,
    poolType: vanchor.poolType,
    // TO UPDATE
    composition: wrappableCurrencies.map((item) => item.symbol),
    deposits24h,
    tvl,
    typedChainIds: vanchor.supportedChains,
  };
};

const getPoolInfoFromVAnchor = async (vanchor: VAnchorType) => {
  const vAnchorAddress = vanchor.address;

  const { wrappableCurrencies, isNativeAllowed } = await fetchAnchorMetadata(
    vAnchorAddress,
    // currently the data for Orbit chains are the same
    vanchor.supportedChains[0]
  );

  const tokenNum =
    // filter zero address
    wrappableCurrencies.filter((item) => BigInt(item.address) !== BigInt(0))
      .length +
    // check native token
    (isNativeAllowed ? 1 : 0) +
    // this is for fungible token
    1;

  let deposits24h: number | undefined;
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        DATE_24H,
        DATE_NOW
      );

    deposits24h = depositVAnchorsByChainsData?.reduce(
      (deposit, vAnchorsByChain) => {
        if (vAnchorsByChain === null) return deposit;
        return deposit + +formatEther(BigInt(vAnchorsByChain?.deposit ?? 0));
      },
      0
    );
  } catch {
    deposits24h = undefined;
  }

  let tvl: number | undefined;
  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChainsDayInterval(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        DATE_24H,
        DATE_NOW
      );

    tvl = tvlVAnchorsByChainsData?.reduce((tvl, vAnchorsByChain) => {
      if (vAnchorsByChain === null) return tvl;
      return tvl + +formatEther(BigInt(vAnchorsByChain?.totalValueLocked ?? 0));
    }, 0);
  } catch {
    tvl = undefined;
  }

  return {
    address: vanchor.address,
    symbol: vanchor.fungibleTokenName,
    poolType: vanchor.poolType,
    token: tokenNum,
    deposits24h,
    tvl,
    typedChainIds: vanchor.supportedChains,
  };
};

export default async function getShieldedTablesData(): Promise<ShieldedTablesDataType> {
  const assetsData = await Promise.all(
    V_ANCHORS.map((vanchor) => getAssetInfoFromVAnchor(vanchor))
  );
  const poolsData = await Promise.all(
    V_ANCHORS.map((vanchor) => getPoolInfoFromVAnchor(vanchor))
  );
  return { assetsData, poolsData };
}
