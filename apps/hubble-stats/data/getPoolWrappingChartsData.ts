import { randNumber } from '@ngneat/falso';
import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS, VANCHORS_MAP } from '../constants';
import {
  getDateFromEpoch,
  getEpochDailyFromStart,
  getEpochStart,
  getNumDatesFromStart,
  getValidDatesToQuery,
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
  const [dateNow, date24h] = getValidDatesToQuery();

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
  let twlData: { [epoch: string]: bigint } = {};
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
        if (!twlMap[epoch]) twlMap[epoch] = BigInt(0);
        twlMap[epoch] += BigInt(twlDataByChain[epoch]);
      });
      return twlMap;
    }, {});
  } catch (e) {
    twlData = {};
  }

  // Wrapping Fees Data
  let wrappingFeesData: { [epoch: string]: bigint } = {};
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
          if (!wrappingFeesMap[epoch]) wrappingFeesMap[epoch] = BigInt(0);
          wrappingFeesMap[epoch] += BigInt(wrappingFeesDataByChain[epoch]);
        });
        return wrappingFeesMap;
      },
      {}
    );
  } catch (e) {
    wrappingFeesData = {};
  }

  return {
    currency: fungibleTokenSymbol,
    twl,
    wrappingFees24h,
    twlData: Object.keys(twlData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: +formatEther(twlData[+epoch]),
      };
    }),
    wrappingFeesData: Object.keys(wrappingFeesData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: +formatEther(wrappingFeesData[+epoch]),
      };
    }),
  };
}
