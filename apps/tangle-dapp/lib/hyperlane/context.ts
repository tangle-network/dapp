import { IRegistry } from '@hyperlane-xyz/registry';
import {
  ChainMap,
  ChainMetadata,
  MultiProtocolProvider,
  WarpCore,
} from '@hyperlane-xyz/sdk';

import assembleChainMetadata from './assembleChainMetadata';
import assembleWarpCoreConfig from './assembleWarpCoreConfig';

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
  const { registry, chains } = await assembleChainMetadata();
  const multiProvider = new MultiProtocolProvider(chains);
  const coreConfig = assembleWarpCoreConfig();
  const warpCore = WarpCore.FromConfig(multiProvider, coreConfig);
  warpContext = { registry, chains, multiProvider, warpCore };
  return warpContext;
}

export function getHyperlaneMultiProvider() {
  return getHyperlaneWarpContext()?.multiProvider ?? null;
}

export function getHyperlaneRegistry() {
  return getHyperlaneWarpContext()?.registry ?? null;
}

export function getHyperlaneWarpCore() {
  return getHyperlaneWarpContext()?.warpCore ?? null;
}

export function removeHyperlaneWarpContext() {
  warpContext = null;
}
