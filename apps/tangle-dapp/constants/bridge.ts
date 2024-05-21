import { chainsConfig } from '@webb-tools/dapp-config';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { BridgeTokenType } from '../types';

// This is just a temporary variable to use as supported source and destination chains
export const BRIDGE_SUPPORTED_CHAINS: ChainConfig[] = [
  chainsConfig[PresetTypedChainId.TangleMainnetNative],
  chainsConfig[PresetTypedChainId.TangleTestnetNative],
];

// This is just a temporary variable to use as supported tokens
export const BRIDGE_SUPPORTED_TOKENS: BridgeTokenType[] = [
  {
    id: 'TNT',
    symbol: 'TNT',
    decimals: {
      default: 18,
    },
    destChainTransactionFee: {},
    existentialDeposit: {},
    substrateAssetId: {},
    sygmaResourceId: '',
  },
];
