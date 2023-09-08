import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS, VANCHORS_MAP } from '../constants';
import {
  getEpochStart,
  getNumDatesFromStart,
  getFormattedDataForBasicChart,
} from '../utils';

export type PoolWrappingChartsDataType = {
  currency?: string;
  twl: number | undefined;
  wrappingFees24h: number | undefined;
  twlData: {
    date: Date;
    value: number;
  }[];
  wrappingFeesData: {
    date: Date;
    value: number;
  }[];
};

export default async function getPoolWrappingChartsData(
  poolAddress: string
): Promise<PoolWrappingChartsDataType> {
  const vanchor = VANCHORS_MAP[poolAddress];
  const { fungibleTokenSymbol } = vanchor;

  const startingEpoch = getEpochStart();
  const numDatesFromStart = getNumDatesFromStart();

  // TWL
  let twl: number | undefined;
  try {
    const twlVAnchorByChainsData =
      await vAnchorClient.TWL.GetVAnchorTWLByChains(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress
      );

    twl = twlVAnchorByChainsData.reduce(
      (twl, vAnchorByChain) =>
        twl + +formatEther(BigInt(vAnchorByChain?.total ?? 0)),
      0
    );
  } catch {
    twl = undefined;
  }

  // Wrapping Fees
  let wrappingFees24h: number | undefined;
  try {
    const twlVAnchorByChainsData =
      await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress
      );

    wrappingFees24h = twlVAnchorByChainsData.reduce(
      (twl, vAnchorByChain) =>
        twl + +formatEther(BigInt(vAnchorByChain?.wrappingFee ?? 0)),
      0
    );
  } catch {
    wrappingFees24h = undefined;
  }

  // TWL Data
  let twlData: { [epoch: string]: number } = {};
  try {
    const fetchedTwlData =
      await vAnchorClient.TWL.GetVAnchorTWLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        startingEpoch,
        numDatesFromStart
      );

    twlData = fetchedTwlData.reduce((twlMap, twlDataByChain) => {
      Object.keys(twlDataByChain).forEach((epoch) => {
        if (!twlMap[epoch]) twlMap[epoch] = 0;
        twlMap[epoch] += +formatEther(BigInt(twlDataByChain[epoch]));
      });
      return twlMap;
    }, {} as { [epoch: string]: number });
  } catch (e) {
    twlData = {};
  }

  // Wrapping Fees Data
  let wrappingFeesData: { [epoch: string]: number } = {};
  try {
    const fetchedWrappingFeesData =
      await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        startingEpoch,
        numDatesFromStart
      );

    wrappingFeesData = fetchedWrappingFeesData.reduce(
      (wrappingFeesMap, wrappingFeesDataByChain) => {
        Object.keys(wrappingFeesDataByChain).forEach((epoch: string) => {
          if (!wrappingFeesMap[epoch]) wrappingFeesMap[epoch] = 0;
          wrappingFeesMap[epoch] += +formatEther(
            BigInt(wrappingFeesDataByChain[epoch])
          );
        });
        return wrappingFeesMap;
      },
      {} as { [epoch: string]: number }
    );
  } catch (e) {
    wrappingFeesData = {};
  }

  return {
    currency: fungibleTokenSymbol,
    twl,
    wrappingFees24h,
    twlData: getFormattedDataForBasicChart(twlData),
    wrappingFeesData: getFormattedDataForBasicChart(wrappingFeesData),
  };
}
