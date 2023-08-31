import { PresetTypedChainId } from '@webb-tools/dapp-types';
import onChainDataJson from '@webb-tools/api-provider-environment/generated/on-chain-config.json';

import { getAnchorMapFromOnChainData } from '../utils';

export const ACTIVE_CHAINS = [
  PresetTypedChainId.HermesOrbit,
  PresetTypedChainId.DemeterOrbit,
  PresetTypedChainId.AthenaOrbit,
  PresetTypedChainId.TangleTestnet,
];

export const VANCHORS_MAP = getAnchorMapFromOnChainData(
  onChainDataJson,
  ACTIVE_CHAINS
);

export const VANCHOR_ADDRESSES = Object.keys(VANCHORS_MAP);
