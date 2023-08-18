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

    tvlData = fetchedTvlData.reduce((tvlMap, tvlDataByChain) => {
      Object.keys(tvlDataByChain).forEach((epoch: string) => {
        if (!tvlMap[epoch]) tvlMap[epoch] = 0;
        tvlMap[epoch] += +formatEther(BigInt(tvlDataByChain[epoch]));
      });
      return tvlMap;
    }, {});
  } catch (e) {
    tvlData = {};
  }

  const volumeData: { [epoch: string]: number } = {};

  return {
    currentTvl,
    currentVolume: volume24h,
    tvlData: Object.keys(tvlData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: tvlData[+epoch],
      };
    }),
    volumeData: Object.keys(volumeData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: volumeData[+epoch],
      };
    }),
  };
}
