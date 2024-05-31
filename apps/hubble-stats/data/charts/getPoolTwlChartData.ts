import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP } from '../../constants';
import type { ChartDataRecord, SubgraphUrlType } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';

async function getVAnchorTwl(
  vAnchorAddress: string,
  subgraphUrls: SubgraphUrlType[],
) {
  let twl: number | undefined;
  try {
    const twlVAnchorByChainsData =
      await vAnchorClient.TWL.GetVAnchorTWLByChains(
        subgraphUrls,
        vAnchorAddress,
      );

    twl = twlVAnchorByChainsData.reduce(
      (twl, vAnchorByChain) =>
        twl + +formatEther(BigInt(vAnchorByChain?.total ?? 0)),
      0,
    );
  } catch {
    twl = undefined;
  }
  return twl;
}

async function getVAnchorTwlDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
  subgraphUrls: SubgraphUrlType[],
): Promise<ChartDataRecord> {
  try {
    const fetchedTwlData =
      await vAnchorClient.TWL.GetVAnchorTWLByChainsByDateRange(
        subgraphUrls,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart,
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
  numDatesFromStart: number,
): Promise<{
  currentPoolTwl?: number;
  poolTwlData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  const { supportedSubgraphs } = VANCHORS_MAP[poolAddress];

  const [currentPoolTwl, poolTwlData] = await Promise.all([
    getVAnchorTwl(poolAddress, supportedSubgraphs),
    getVAnchorTwlDataByDateRange(
      poolAddress,
      startingEpoch,
      numDatesFromStart,
      supportedSubgraphs,
    ),
  ] as const);

  return {
    currentPoolTwl,
    poolTwlData: getFormattedDataForBasicChart(poolTwlData),
  };
}
