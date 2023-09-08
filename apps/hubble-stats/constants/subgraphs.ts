import { PresetTypedChainId } from '@webb-tools/dapp-types';
import vAnchorClient from '@webb-tools/vanchor-client';

export const LIVE_SUBGRAPH_MAP = {
  [PresetTypedChainId.AthenaOrbit]:
    vAnchorClient.SubgraphUrl.vAnchorOrbitAthena,
  [PresetTypedChainId.HermesOrbit]:
    vAnchorClient.SubgraphUrl.vAnchorOrbitHermes,
  [PresetTypedChainId.DemeterOrbit]:
    vAnchorClient.SubgraphUrl.vAnchorOrbitDemeter,
  [PresetTypedChainId.TangleTestnet]:
    vAnchorClient.SubgraphUrl.vAnchorTangleTestnet,
};

const LIVE_SUBGRAPH_URLS = Object.values(LIVE_SUBGRAPH_MAP);

export const LOCAL_SUBGRAPH_URLS = [
  vAnchorClient.SubgraphUrl.vAnchorAthenaLocal,
  vAnchorClient.SubgraphUrl.vAnchorHermesLocal,
  vAnchorClient.SubgraphUrl.vAnchorDemeterLocal,
];

export const ACTIVE_SUBGRAPH_URLS = process.env.USING_LOCAL_SUBGRAPHS
  ? LOCAL_SUBGRAPH_URLS
  : LIVE_SUBGRAPH_URLS;
