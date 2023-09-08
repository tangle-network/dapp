import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl, getDeposit24h } from './reusable';
import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../constants';
import { getValidDatesToQuery, getChangeRate } from '../utils';

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
    // tvl calculation for 24h is not correct at the moment
    tvlChangeRate: undefined,
    deposit24h,
    depositChangeRate,
    relayerFees,
    wrappingFees,
  };
}
