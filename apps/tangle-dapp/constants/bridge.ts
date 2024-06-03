import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { BridgeTokenId, BridgeTokenType, ChainId } from '../types/bridge';

export const BRIDGE_SUPPORTED_TOKENS: Record<BridgeTokenId, BridgeTokenType> = {
  tTNT: {
    id: 'tTNT',
    symbol: 'tTNT',
    existentialDeposit: {},
    destChainTransactionFee: {},
    decimals: { default: 18 },
  },
  TNT: {
    id: 'TNT',
    symbol: 'TNT',
    existentialDeposit: {},
    destChainTransactionFee: {},
    decimals: { default: 18 },
  },
  // NOTE: this is for testing, will remove later
  PHA: {
    id: 'PHA',
    symbol: 'PHA',
    existentialDeposit: {},
    destChainTransactionFee: {},
    decimals: { default: 18 },
  },
};

// A Map with key as source chain id and value as another map
// with key as destination chain id and value as supported tokens
type BridgeType = Record<
  ChainId, // Source Chain Id
  Record<
    ChainId, // Destination Chain Id
    {
      supportedTokens: BridgeTokenId[];
    }
  >
>;

// TODO: This is a dummy data for now
// export const BRIDGE: BridgeType = {
//   [PresetTypedChainId.TangleMainnetEVM]: {
//     [PresetTypedChainId.TangleTestnetEVM]: {
//       supportedTokens: ['TNT'],
//     },
//     [PresetTypedChainId.TangleTestnetNative]: {
//       supportedTokens: ['TNT'],
//     },
//     [PresetTypedChainId.TangleMainnetNative]: {
//       supportedTokens: ['TNT'],
//     },
//   },

//   [PresetTypedChainId.TangleTestnetEVM]: {
//     [PresetTypedChainId.TangleMainnetEVM]: {
//       supportedTokens: ['tTNT'],
//     },
//     [PresetTypedChainId.TangleTestnetNative]: {
//       supportedTokens: ['tTNT'],
//     },
//     [PresetTypedChainId.TangleMainnetNative]: {
//       supportedTokens: ['tTNT'],
//     },
//   },

//   [PresetTypedChainId.TangleMainnetNative]: {
//     [PresetTypedChainId.TangleTestnetEVM]: {
//       supportedTokens: ['TNT'],
//     },
//     [PresetTypedChainId.TangleMainnetEVM]: {
//       supportedTokens: ['TNT'],
//     },
//     [PresetTypedChainId.TangleTestnetNative]: {
//       supportedTokens: ['TNT'],
//     },
//   },

//   [PresetTypedChainId.TangleTestnetNative]: {
//     [PresetTypedChainId.TangleMainnetEVM]: {
//       supportedTokens: ['tTNT'],
//     },
//     [PresetTypedChainId.TangleTestnetEVM]: {
//       supportedTokens: ['tTNT'],
//     },
//     [PresetTypedChainId.TangleMainnetNative]: {
//       supportedTokens: ['tTNT'],
//     },
//   },
// };

export const BRIDGE: BridgeType = {
  [PresetTypedChainId.Sepolia]: {
    [PresetTypedChainId.RococoPhala]: {
      supportedTokens: ['PHA'],
    },
  },

  [PresetTypedChainId.RococoPhala]: {
    [PresetTypedChainId.Sepolia]: {
      supportedTokens: ['PHA'],
    },
  },
};
