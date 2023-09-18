import onChainDataJson from '@webb-tools/api-provider-environment/generated/on-chain-config.json';

import { ACTIVE_SUBGRAPH_MAP } from './subgraphs';
import { getVAnchorMapFromOnChainData } from '../utils';

export const ACTIVE_CHAINS = Object.keys(ACTIVE_SUBGRAPH_MAP).map(
  (typedChainedId) => +typedChainedId
);

export const VANCHORS_MAP = getVAnchorMapFromOnChainData(
  onChainDataJson,
  ACTIVE_CHAINS
);

export const VANCHOR_ADDRESSES = Object.keys(VANCHORS_MAP);
