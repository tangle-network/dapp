import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';
import type { ChartDataRecord } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';

async function getVAnchorTwl(vAnchorAddress: string) {
  let twl: number | undefined;
  try {
    const twlVAnchorByChainsData =
      await vAnchorClient.TWL.GetVAnchorTWLByChains(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress
      );

    twl = twlVAnchorByChainsData.reduce(
      (twl, vAnchorByChain) =>
        twl + +formatEther(BigInt(vAnchorByChain?.total ?? 0)),
      0
    );
  } catch {
    twl = undefined;
  }
  return twl;
}

async function getVAnchorTwlDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number
): Promise<ChartDataRecord> {
  try {
    const fetchedTwlData =
      await vAnchorClient.TWL.GetVAnchorTWLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart
      );

    return serializeEpochData(fetchedTwlData);
  } catch (e) {
    console.error('Error fetching TWL data', e);
  }

  return {};
}

export default async function getPoolTwlChartData(
  poolAddress: string,
  startingEpoch: number,
  numDatesFromStart: number
): Promise<{
  currentPoolTwl?: number;
  poolTwlData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  const [currentPoolTwl, poolTwlData] = await Promise.all([
    getVAnchorTwl(poolAddress),
    getVAnchorTwlDataByDateRange(poolAddress, startingEpoch, numDatesFromStart),
  ] as const);

  return {
    currentPoolTwl,
    poolTwlData: getFormattedDataForBasicChart(poolTwlData),
  };
}
