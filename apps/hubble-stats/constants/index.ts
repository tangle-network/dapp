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

export const ACTIVE_SUBGRAPH_URLS = process.env.USING_LIVE_SUBGRAPHS
  ? LIVE_SUBGRAPH_URLS
  : LOCAL_SUBGRAPH_URLS;

export const VANCHOR_ADDRESSES: string[] = JSON.parse(
  process.env.VANCHOR_ADDRESSES ?? '[]'
);
