import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import {
  vAnchorAddresses,
  availableSubgraphUrls,
  startingEpoch,
} from '../constants';
import {
  getNumOfDatesFromStart,
  getDateFromEpoch,
  getEpochFromDate,
} from '../utils';

export type OverviewChartsDataType = {
  currentTvl: number | undefined;
  currentVolume: number | undefined;
  tvlData:
    | {
        date: Date;
        value: number;
      }[]
    | undefined;
  volumeData:
    | {
        date: Date;
        value: number;
      }[]
    | undefined;
};

export default async function getOverviewChartsData(): Promise<OverviewChartsDataType> {
  let currentTvl: number | undefined;
  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTotalValueLockedByChains(
        availableSubgraphUrls,
        vAnchorAddresses
      );

    currentTvl = tvlVAnchorsByChainsData?.reduce(
      (tvlTotal, vAnchorsByChain) => {
        const tvlVAnchorsByChain = vAnchorsByChain.reduce(
          (tvlTotalByChain, vAnchor) =>
            tvlTotalByChain +
            +formatEther(BigInt(vAnchor.totalValueLocked ?? 0)),
          0
        );
        return tvlTotal + tvlVAnchorsByChain;
      },
      0
    );
  } catch {
    currentTvl = undefined;
  }

  let volume24h: number | undefined;
  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains15MinsInterval(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(getEpochFromDate(new Date()) - 24 * 60 * 60),
        new Date()
      );

    volume24h = volumeVAnchorsByChainsData?.reduce(
      (volumeTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (volumeTotalByChain, vAnchor) =>
            volumeTotalByChain + +formatEther(BigInt(vAnchor.volume ?? 0)),
          0
        );
        return volumeTotal + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    volume24h = undefined;
  }

  let tvlData: { [epoch: string]: number } = {};
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainsByDateRange(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        getNumOfDatesFromStart()
      );

    console.log('fetchedTvlData :', fetchedTvlData);
    tvlData = fetchedTvlData.reduce((tvlMap, tvlDataByChain) => {
      Object.keys(tvlDataByChain).forEach((epoch: string) => {
        if (!tvlMap[epoch]) tvlMap[epoch] = 0;
        tvlMap[epoch] += +formatEther(BigInt(tvlDataByChain[epoch]));
      });
      return tvlMap;
    }, {});
  } catch (e) {
    console.log('e :', e);
    tvlData = {};
  }

  let volumeData: { [epoch: string]: number } = {};
  try {
    const fetchedVolumeData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChainsByDateRange(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        getNumOfDatesFromStart()
      );

    console.log('fetchedVolumeData :', fetchedVolumeData);
    volumeData = fetchedVolumeData.reduce((volumeMap, volumeDataByChain) => {
      Object.keys(volumeDataByChain).forEach((epoch: string) => {
        if (!volumeMap[epoch]) volumeMap[epoch] = 0;
        volumeMap[epoch] += +formatEther(BigInt(volumeDataByChain[epoch]));
      });
      return volumeMap;
    }, {});
  } catch (e) {
    console.log('e :', e);
    volumeData = {};
  }

  // Test
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainByDateRange(
        availableSubgraphUrls[0],
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        getNumOfDatesFromStart()
      );
    console.log('fetchedTvlData :', fetchedTvlData);
  } catch (e) {
    console.log('e :', e);
  }

  try {
    const volumeDateRangeData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChainByDateRange(
        availableSubgraphUrls[0],
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        getNumOfDatesFromStart()
      );

    console.log('volumeDateRangeData: ', volumeDateRangeData);
  } catch (error) {
    console.log('error :', error);
  }

  return {
    currentTvl,
    currentVolume: volume24h,
    tvlData: Object.keys(tvlData).map((epoch) => {
      return {
        date: getDateFromEpoch(+epoch),
        value: tvlData[+epoch],
      };
    }),
    volumeData: Object.keys(volumeData).map((epoch) => {
      return {
        date: getDateFromEpoch(+epoch),
        value: volumeData[+epoch],
      };
    }),
  };
}
