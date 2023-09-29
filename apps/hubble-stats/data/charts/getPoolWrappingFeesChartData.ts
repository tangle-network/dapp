import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';
import type { ChartDataRecord } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';

async function getVAnchorWrappingFees(vAnchorAddress: string) {
  let wrappingFees: number | undefined;
  try {
    const wrappingFeesVAnchorByChainsData =
      await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
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
  numDatesFromStart: number
): Promise<ChartDataRecord> {
  try {
    const fetchedWrappingFeesData =
      await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
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
  const [poolWrappingFees, poolWrappingFeesData] = await Promise.all([
    getVAnchorWrappingFees(poolAddress),
    getVAnchorWrappingFeesDataByDateRange(
      poolAddress,
      startingEpoch,
      numDatesFromStart
    ),
  ] as const);

  return {
    poolWrappingFees,
    poolWrappingFeesData: getFormattedDataForBasicChart(poolWrappingFeesData),
  };
}
