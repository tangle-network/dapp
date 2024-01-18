import { PresetTypedChainId } from '@webb-tools/dapp-types';
import vAnchorClient from '@webb-tools/vanchor-client';

const LIVE_SUBGRAPH_MAP = {
  [PresetTypedChainId.TangleTestnet]:
    vAnchorClient.SubgraphUrl.vAnchorTangleTestnet,
};

const LOCAL_SUBGRAPH_MAP = {
  [PresetTypedChainId.AthenaLocalnet]:
    vAnchorClient.SubgraphUrl.vAnchorAthenaLocal,
  [PresetTypedChainId.HermesLocalnet]:
    vAnchorClient.SubgraphUrl.vAnchorHermesLocal,
  [PresetTypedChainId.DemeterLocalnet]:
    vAnchorClient.SubgraphUrl.vAnchorDemeterLocal,
};

const LIVE_SUBGRAPH_URLS = Object.values(LIVE_SUBGRAPH_MAP);
const LOCAL_SUBGRAPH_URLS = Object.values(LOCAL_SUBGRAPH_MAP);

export const ACTIVE_SUBGRAPH_MAP = process.env.USING_LOCAL_SUBGRAPHS
  ? LOCAL_SUBGRAPH_MAP
  : LIVE_SUBGRAPH_MAP;

export const ACTIVE_SUBGRAPH_URLS = process.env.USING_LOCAL_SUBGRAPHS
  ? LOCAL_SUBGRAPH_URLS
  : LIVE_SUBGRAPH_URLS;
