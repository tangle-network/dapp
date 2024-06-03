import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { LOCALNET_CHAIN_IDS } from '../chains';

type AnchorWithSignatureBridgeMapType = Record<string, string>;
type ChainWithAnchorsMapType = Record<number, AnchorWithSignatureBridgeMapType>;

const localAnchorRecord = process.env.BRIDGE_DAPP_LOCAL_ORBIT_ANCHOR_ADDRESS
  ? LOCALNET_CHAIN_IDS.reduce<ChainWithAnchorsMapType>((acc, chainId) => {
      const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
      const anchorAddress: string = process.env
        .BRIDGE_DAPP_LOCAL_ORBIT_ANCHOR_ADDRESS as string;

      acc[typedChainId] = {
        [anchorAddress]: '',
      };

      return acc;
    }, {})
  : {};

/**
 * The anchor -> signature bridge record
 *
 * typed chain id -> anchor address -> signature bridge address
 */
export const anchorSignatureBridge: ChainWithAnchorsMapType = {
  ...localAnchorRecord,
};
