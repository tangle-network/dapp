import { IToken, Token } from '@hyperlane-xyz/sdk';
import { isNullish } from '@hyperlane-xyz/utils';

import { getHyperlaneWarpCore } from './context';

export function getTokenByIndex(tokenIndex?: number) {
  const warpCore = getHyperlaneWarpCore();
  if (!warpCore) throw new Error('Hyperlane Warp Core not initialized');

  const tokens = warpCore.tokens;
  if (isNullish(tokenIndex) || tokenIndex >= tokens.length) return null;
  return tokens[tokenIndex];
}

export function getIndexForToken(token?: IToken): number | null {
  const warpCore = getHyperlaneWarpCore();
  if (!warpCore) throw new Error('Hyperlane Warp Core not initialized');

  if (!token) return null;
  const index = warpCore.tokens.indexOf(token as Token);
  if (typeof index === 'number' && index >= 0) return index;
  else return null;
}

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
