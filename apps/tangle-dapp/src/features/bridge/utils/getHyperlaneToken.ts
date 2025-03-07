import { IToken } from '@hyperlane-xyz/sdk';
import { getHyperlaneWarpCore } from '../context/BridgeHyperlaneContext/BridgeHyperlaneContext';

export default function getHyperlaneToken(
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
