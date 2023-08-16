import { randNumber } from '@ngneat/falso';
import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import {
  vAnchorAddresses,
  allLocalSubgraphUrls,
  startingEpoch,
} from '../constants';
import { getNumOfDatesFromStart, getDateFromEpoch } from '../utils';

export type OverviewChartsDataType = {
  currentTvl: number;
  currentVolume: number;
  tvlData: {
    date: Date;
    value: number;
  }[];
  volumeData: {
    date: Date;
    value: number;
  }[];
};

export default async function getOverviewChartsData(): Promise<OverviewChartsDataType> {
  const tvlData: { [epoch: string]: number } = {};
  const depositData: { [epoch: number]: number } = {};

  // await allLocalSubgraphUrls.forEach(async (subgraphUrl) => {
  //   const tvlDateRangeData =
  //     await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainByDateRange(
  //       vAnchorClient.SubgraphUrl.vAnchorAthenaLocal,
  //       ['0x91eb86019fd8d7c5a9e31143d422850a13f670a3'],
  //       getDateFromEpoch(1692057600),
  //       1
  //     );

  //   console.log("tvlDateRangeData: ", tvlDateRangeData);

  //   Object.keys(tvlDateRangeData).forEach((epoch: string) => {
  //     if (!tvlData[epoch]) tvlData[epoch] = 0;
  //     tvlData[epoch] += +formatEther(
  //       BigInt(tvlDateRangeData[epoch as any] as number)
  //     );
  //   });

  //   console.log(tvlDateRangeData);
  // });

  try {
    console.log(
      'vAnchorClient: ',
      vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainByDateRange
    );

    const tvlDateRangeData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainByDateRange(
        vAnchorClient.SubgraphUrl.vAnchorAthenaLocal,
        ['0x91eb86019fd8d7c5a9e31143d422850a13f670a3'],
        getDateFromEpoch(1692057600),
        1
      );

    console.log('tvlDateRangeData: ', tvlDateRangeData);
  } catch (error) {
    console.log('error :', error);
  }

  // allLocalSubgraphUrls.forEach(async (subgraphUrl) => {
  //   const tvlDateRangeData =
  //     await vAnchorClient.Deposit.GetVAnchorsDepositByChainByDateRange(
  //       subgraphUrl,
  //       vAnchorAddresses,
  //       getDateFromEpoch(1692057600),
  //       1
  //     );

  //   console.log(tvlDateRangeData);
  // });

  return {
    currentTvl: randNumber({ min: 10_000_000, max: 20_000_000 }),
    currentVolume: randNumber({ min: 1_000_000, max: 10_000_000 }),
    tvlData: Object.keys(tvlData).map((epoch) => {
      return {
        date: getDateFromEpoch(+epoch),
        value: tvlData[+epoch],
      };
    }),
    volumeData: [...Array(100).keys()].map((i) => {
      return {
        // Getting warning in console: Only plain objects can be passed to Client Components from Server Components. Date objects are not supported.
        // Fix: https://github.com/vercel/next.js/issues/11993#issuecomment-617375501
        date: JSON.parse(
          JSON.stringify(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
        ),
        value: randNumber({ min: 1_000_000, max: 10_000_000 }),
      };
    }),
  };
}
