import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl, getDeposit24h } from './reusable';
import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../constants';
import { getValidDatesToQuery } from '../utils';

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
    const relayerFeesVAnchorsByChainsData =
      await vAnchorClient.RelayerFee.GetVAnchorsRelayerFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    relayerFees = relayerFeesVAnchorsByChainsData?.reduce(
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
    const wrappingFeesVAnchorsByChainsData =
      await vAnchorClient.WrappingFee.GetVAnchorsWrappingFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES
      );

    wrappingFees = wrappingFeesVAnchorsByChainsData?.reduce(
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
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTotalValueLockedByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        date48h,
        date24h
      );

    // get the latest item since it's the most updated
    // this is to prevent the case when there is no data for certain 15mins intervals
    tvl24h = tvlVAnchorsByChainsData?.reduce((tvlTotal, vAnchorsByChain) => {
      if (vAnchorsByChain.length === 0) return tvlTotal;
      return (
        tvlTotal +
        +formatEther(
          BigInt(
            vAnchorsByChain[vAnchorsByChain.length - 1].totalValueLocked ?? 0
          )
        )
      );
    }, 0);
  } catch {
    tvl24h = undefined;
  }

  // follow Uniswap's formula
  // https://github.com/Uniswap/v3-info/blob/master/src/data/protocol/overview.ts#L95
  const tvlChangeRate =
    tvl && tvl24h ? ((tvl - tvl24h) / tvl24h) * 100 : undefined;

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

  // follow Uniswap's formula
  // https://github.com/Uniswap/v3-info/blob/master/src/data/protocol/overview.ts#L93
  const depositChangeRate =
    deposit24h && deposit48h
      ? ((deposit24h - deposit48h) / deposit48h) * 100
      : undefined;

  return {
    tvl,
    tvlChangeRate,
    deposit24h,
    depositChangeRate,
    relayerFees,
    wrappingFees,
  };
}
