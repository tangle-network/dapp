import vAnchorClient from '@webb-tools/vanchor-client';

export const vAnchorAddresses = ['0x91eb86019fd8d7c5a9e31143d422850a13f670a3'];

export const allSubgraphUrls = [
  vAnchorClient.SubgraphUrl.vAnchorOrbitAthena,
  vAnchorClient.SubgraphUrl.vAnchorOrbitHermes,
  vAnchorClient.SubgraphUrl.vAnchorOrbitDemeter,
];

export const allLocalSubgraphUrls = [
  vAnchorClient.SubgraphUrl.vAnchorAthenaLocal,
  vAnchorClient.SubgraphUrl.vAnchorHermesLocal,
  vAnchorClient.SubgraphUrl.vAnchorDemeterLocal,
];

export const availableSubgraphUrls = allLocalSubgraphUrls;

export const startingEpoch = 1692057600;

export const numOfDatesFromStart =
  1 + Math.floor((new Date().getTime() / 1000 - startingEpoch) / 86400);
