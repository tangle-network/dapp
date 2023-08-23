import vAnchorClient from '@webb-tools/vanchor-client';
import { getDateFromEpoch, getEpochFromDate } from '../utils';

export const VANCHOR_ADDRESSES = ['0x7aA556dD0AF8bed063444E14A6A9af46C9266973'];

export const LIVE_SUBGRAPH_URLS = [
  vAnchorClient.SubgraphUrl.vAnchorOrbitAthena,
  vAnchorClient.SubgraphUrl.vAnchorOrbitHermes,
  vAnchorClient.SubgraphUrl.vAnchorOrbitDemeter,
];

export const LOCAL_SUBGRAPH_URLS = [
  vAnchorClient.SubgraphUrl.vAnchorAthenaLocal,
  vAnchorClient.SubgraphUrl.vAnchorHermesLocal,
  vAnchorClient.SubgraphUrl.vAnchorDemeterLocal,
];

export const ACTIVE_SUBGRAPH_URLS = LIVE_SUBGRAPH_URLS;

export const EPOCH_DAY_INTERVAL = 24 * 60 * 60;

export const EPOCH_NOW = getEpochFromDate(new Date());
export const EPOCH_7D = EPOCH_NOW - 6 * EPOCH_DAY_INTERVAL;

// Set starting epoch to get the data of the last 7 days
export const STARTING_EPOCH =
  Math.floor(EPOCH_7D / EPOCH_DAY_INTERVAL) * EPOCH_DAY_INTERVAL;

/**
 * Total number of days have passed since the starting epoch
 */
export const NUM_DATES_FROM_START =
  1 +
  Math.floor(
    (new Date().getTime() / 1000 - STARTING_EPOCH) / EPOCH_DAY_INTERVAL
  );

// getting valid dates to query
// TODO: update the back-end to receive the epoch instead of the date
export const DATE_NOW = getDateFromEpoch(getEpochFromDate(new Date()));
export const DATE_24H = getDateFromEpoch(
  getEpochFromDate(new Date()) - EPOCH_DAY_INTERVAL
);
export const DATE_48H = getDateFromEpoch(
  getEpochFromDate(new Date()) - 2 * EPOCH_DAY_INTERVAL
);
