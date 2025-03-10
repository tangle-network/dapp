import { IRegistry } from '@hyperlane-xyz/registry';
import {
  ChainMap,
  ChainMetadata,
  MultiProtocolProvider,
  WarpCore,
} from '@hyperlane-xyz/sdk';
import hyperlaneAssembleChainMetadata from '../../utils/hyperlaneAssembleChainMetadata';
import hyperlaneAssembleWarpCoreConfig from '../../utils/hyperlaneAssembleWarpCoreConfig';

export interface HyperlaneWarpContext {
  registry: IRegistry;
  chains: ChainMap<ChainMetadata>;
  multiProvider: MultiProtocolProvider;
  warpCore: WarpCore;
}

let warpContext: HyperlaneWarpContext | null = null;

export function getHyperlaneWarpContext() {
  return warpContext;
}

export async function initHyperlaneWarpContext() {
  const { registry, chains } = await hyperlaneAssembleChainMetadata();
  const multiProvider = new MultiProtocolProvider(chains);
  const coreConfig = hyperlaneAssembleWarpCoreConfig();
  const warpCore = WarpCore.FromConfig(multiProvider, coreConfig);
  warpContext = { registry, chains, multiProvider, warpCore };
  return warpContext;
}

export function getHyperlaneWarpCore() {
  return getHyperlaneWarpContext()?.warpCore ?? null;
}

export function removeHyperlaneWarpContext() {
  warpContext = null;
}
