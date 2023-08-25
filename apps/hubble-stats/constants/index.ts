import vAnchorClient from '@webb-tools/vanchor-client';

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

export const ACTIVE_SUBGRAPH_URLS = process.env.USING_LOCAL_SUBGRAPHS
  ? LOCAL_SUBGRAPH_URLS
  : LIVE_SUBGRAPH_URLS;

export const VANCHOR_ADDRESSES: string[] = process.env.VANCHOR_ADDRESSES
  ? JSON.parse(process.env.VANCHOR_ADDRESSES)
  : ['0x7aA556dD0AF8bed063444E14A6A9af46C9266973'];
