import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';

import { VANCHORS_MAP } from '../../constants';
import type { ChartDataRecord, SubgraphUrlType } from '../../types';
import { getFormattedDataForBasicChart } from '../../utils';

async function getVAnchorRelayerEarningsData(
  vAnchorAddress: string,
  subgraphUrls: SubgraphUrlType[]
) {
  let relayerEarnings: number | undefined;
  try {
    const fetchedRelayerEarningsData =
      await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChains(
        subgraphUrls,
        vAnchorAddress
      );

    relayerEarnings = fetchedRelayerEarningsData.reduce(
      (total, relayerFeeByChain) => {
        return total + +formatEther(BigInt(relayerFeeByChain.profit ?? 0));
      },
      0
    );
  } catch {
    relayerEarnings = undefined;
  }
  return relayerEarnings;
}

async function getVAnchorRelayerEarningsDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
  subgraphUrls: SubgraphUrlType[]
): Promise<ChartDataRecord> {
  try {
    const fetchedRelayerFeesData =
      await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChainsByDateRange(
        subgraphUrls,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart
      );

    const relayerEarningsData = fetchedRelayerFeesData.reduce(
      (relayerEarningsMap, relayerEarningsByChain) => {
        Object.keys(relayerEarningsByChain).forEach((epoch) => {
          if (!relayerEarningsMap[epoch]) relayerEarningsMap[epoch] = 0;
          relayerEarningsMap[epoch] += +formatEther(
            BigInt(relayerEarningsByChain[epoch].profit)
          );
        });
        return relayerEarningsMap;
      },
      {} as { [epoch: string]: number }
    );

    return relayerEarningsData;
  } catch (e) {
    console.error('Error fetching Relayer Fees date range data', e);
  }
  return {};
}

export default async function getPoolRelayerEarningsChartData(
  poolAddress: string,
  startingEpoch: number,
  numDatesFromStart: number
): Promise<{
  relayerEarnings?: number;
  poolRelayerEarningsData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  const { supportedSubgraphs } = VANCHORS_MAP[poolAddress];

  const [relayerEarnings, poolRelayerEarningsData] = await Promise.all([
    getVAnchorRelayerEarningsData(poolAddress, supportedSubgraphs),
    getVAnchorRelayerEarningsDataByDateRange(
      poolAddress,
      startingEpoch,
      numDatesFromStart,
      supportedSubgraphs
    ),
  ] as const);

  return {
    relayerEarnings,
    poolRelayerEarningsData: getFormattedDataForBasicChart(
      poolRelayerEarningsData
    ),
  };
}
