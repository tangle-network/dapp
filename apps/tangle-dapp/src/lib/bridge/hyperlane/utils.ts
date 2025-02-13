import { IToken } from '@hyperlane-xyz/sdk';

import { getHyperlaneWarpCore } from './context';
import { PresetTypedChainId } from '@tangle-network/dapp-types';

export function tryFindToken(
  chain: string,
  addressOrDenom?: string,
): IToken | null {
  const warpCore = getHyperlaneWarpCore();
  if (!warpCore) throw new Error('Hyperlane Warp Core not initialized');

  try {
    return warpCore.findToken(chain, addressOrDenom);
  } catch {
    return null;
  }
}

export function getHyperlaneChainName(typedChainId: number) {
  switch (typedChainId) {
    case PresetTypedChainId.Arbitrum:
      return 'arbitrum';
    case PresetTypedChainId.Optimism:
      return 'optimism';
    case PresetTypedChainId.Base:
      return 'base';
    case PresetTypedChainId.BSC:
      return 'bsc';
    case PresetTypedChainId.Polygon:
      return 'polygon';
    case PresetTypedChainId.TangleMainnetEVM:
      return 'tangle';
    case PresetTypedChainId.TangleTestnetEVM:
      return 'tangletestnet';
    case PresetTypedChainId.Holesky:
      return 'holesky';
    default:
      throw new Error('Unknown chain');
  }
}
