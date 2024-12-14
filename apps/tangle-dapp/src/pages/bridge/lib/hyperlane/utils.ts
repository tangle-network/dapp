import { IToken } from '@hyperlane-xyz/sdk';

import { getHyperlaneWarpCore } from './context';
import { PresetTypedChainId } from '@webb-tools/dapp-types';

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
    case PresetTypedChainId.TangleTestnetEVM:
      return 'tangletestnet';
    case PresetTypedChainId.Holesky:
      return 'holesky';
    default:
      throw new Error('Unknown chain');
  }
}
