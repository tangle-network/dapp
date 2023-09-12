import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl, getDeposit24h } from './reusable';
import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../constants';
import {
  getValidDatesToQuery,
  getChangeRate,
  getEpochStart,
  getEpoch24H,
} from '../utils';

type KeyMetricDataType = {
  tvl: number | undefined;
  tvlChangeRate: number | undefined;
  deposit24h: number | undefined;
  depositChangeRate: number | undefined;
  relayerFees: number | undefined;
  wrappingFees: number | undefined;
};

export default async function getKeyMetricsData(): Promise<KeyMetricDataType> {
  const [_, date24h, date48h] = getValidDatesToQuery();
  const epochStart = getEpochStart();
  const epoch24h = getEpoch24H();

  const tvl = await getTvl();
  const deposit24h = await getDeposit24h();

  let relayerFees: number | undefined;
  try {
    const fetchedRelayerFeesData =
      await vAnchorClient.RelayerFee.GetVAnchorsRelayerFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    relayerFees = fetchedRelayerFeesData.reduce(
      (relayerFeesTotal, vAnchorsByChain) => {
        const relayerFeesVAnchorsByChain = vAnchorsByChain.reduce(
          (relayerFeesTotalByChain, vAnchor) =>
            relayerFeesTotalByChain + +formatEther(BigInt(vAnchor.profit ?? 0)),
          0
        );
        return relayerFeesTotal + relayerFeesVAnchorsByChain;
      },
      0
    );
  } catch {
    relayerFees = undefined;
  }

  let wrappingFees: number | undefined;
  try {
    const fetchedWrappingFeesData =
      await vAnchorClient.WrappingFee.GetVAnchorsWrappingFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    wrappingFees = fetchedWrappingFeesData?.reduce(
      (wrappingFeesTotal, vAnchorsByChain) => {
        const wrappingFeesVAnchorsByChain = vAnchorsByChain.reduce(
          (wrappingFeesTotalByChain, vAnchor) =>
            wrappingFeesTotalByChain +
            +formatEther(BigInt(vAnchor.wrappingFee ?? 0)),
          0
        );
        return wrappingFeesTotal + wrappingFeesVAnchorsByChain;
      },
      0
    );
  } catch {
    wrappingFees = undefined;
  }

  let tvl24h: number | undefined;
  try {
    const latestTvlByVAnchorsByChains =
      await vAnchorClient.TotalValueLocked.GetVAnchorsByChainsLatestTVLInTimeRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        epochStart,
        epoch24h
      );

    tvl24h = Object.values(latestTvlByVAnchorsByChains).reduce(
      (total, tvlByVAnchorsByChain) => {
        const latestTvlByChain = tvlByVAnchorsByChain.reduce(
          (totalByChain, tvlByVAnchor) =>
            totalByChain +
            +formatEther(BigInt(tvlByVAnchor.totalValueLocked ?? 0)),
          0
        );
        return total + latestTvlByChain;
      },
      0
    );
  } catch {
    tvl24h = undefined;
  }

  const tvlChangeRate = getChangeRate(tvl, tvl24h);

  let deposit48h: number | undefined;
  try {
    const depositVAnchorsByChainsData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        date48h,
        date24h
      );

    deposit48h = depositVAnchorsByChainsData?.reduce(
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
    deposit48h = undefined;
  }

  const depositChangeRate = getChangeRate(deposit24h, deposit48h);

  return {
    tvl,
    tvlChangeRate,
    deposit24h,
    depositChangeRate,
    relayerFees,
    wrappingFees,
  };
}
