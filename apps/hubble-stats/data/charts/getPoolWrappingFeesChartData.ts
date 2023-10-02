import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP } from '../../constants';
import type { ChartDataRecord, SubgraphUrlType } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';

async function getVAnchorWrappingFees(
  vAnchorAddress: string,
  subgraphUrls: SubgraphUrlType[]
) {
  let wrappingFees: number | undefined;
  try {
    const wrappingFeesVAnchorByChainsData =
      await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChains(
        subgraphUrls,
        vAnchorAddress
      );

    wrappingFees = wrappingFeesVAnchorByChainsData.reduce(
      (fees, vAnchorByChain) =>
        fees + +formatEther(BigInt(vAnchorByChain?.wrappingFee ?? 0)),
      0
    );
  } catch {
    wrappingFees = undefined;
  }

  return wrappingFees;
}

async function getVAnchorWrappingFeesDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
  subgraphUrls: SubgraphUrlType[]
): Promise<ChartDataRecord> {
  try {
    const fetchedWrappingFeesData =
      await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChainsByDateRange(
        subgraphUrls,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart
      );

    return serializeEpochData(fetchedWrappingFeesData);
  } catch (e) {
    console.error('Error fetching wrapping fees data', e);
  }

  return {};
}

export default async function getPoolWrappingFeesChartData(
  poolAddress: string,
  startingEpoch: number,
  numDatesFromStart: number
): Promise<{
  poolWrappingFees?: number;
  poolWrappingFeesData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  const { supportedSubgraphs } = VANCHORS_MAP[poolAddress];

  const [poolWrappingFees, poolWrappingFeesData] = await Promise.all([
    getVAnchorWrappingFees(poolAddress, supportedSubgraphs),
    getVAnchorWrappingFeesDataByDateRange(
      poolAddress,
      startingEpoch,
      numDatesFromStart,
      supportedSubgraphs
    ),
  ] as const);

  return {
    poolWrappingFees,
    poolWrappingFeesData: getFormattedDataForBasicChart(poolWrappingFeesData),
  };
}
