import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { BridgeTokenId, BridgeTokenType, ChainId } from '../types/bridge';

export const BRIDGE_SUPPORTED_TOKENS: Record<BridgeTokenId, BridgeTokenType> = {
  tTNT: {
    id: 'tTNT',
    symbol: 'tTNT',
    existentialDeposit: {},
    destChainTransactionFee: {},
  },
  TNT: {
    id: 'TNT',
    symbol: 'TNT',
    existentialDeposit: {},
    destChainTransactionFee: {},
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
export const BRIDGE: BridgeType = {
  [PresetTypedChainId.Sepolia]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: ['TNT'],
    },
    [PresetTypedChainId.TangleTestnetEVM]: {
      supportedTokens: ['tTNT'],
    },
    [PresetTypedChainId.Polkadot]: {
      supportedTokens: ['tTNT', 'TNT'],
    },
  },

  [PresetTypedChainId.Polkadot]: {
    [PresetTypedChainId.TangleTestnetEVM]: {
      supportedTokens: ['tTNT'],
    },
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: ['TNT'],
    },
    [PresetTypedChainId.Sepolia]: {
      supportedTokens: ['tTNT', 'TNT'],
    },
  },

  [PresetTypedChainId.TangleMainnetEVM]: {
    [PresetTypedChainId.TangleTestnetEVM]: {
      supportedTokens: ['tTNT', 'TNT'],
    },
    [PresetTypedChainId.Sepolia]: {
      supportedTokens: ['TNT'],
    },
    [PresetTypedChainId.Polkadot]: {
      supportedTokens: ['TNT'],
    },
  },

  [PresetTypedChainId.TangleTestnetEVM]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: ['tTNT', 'TNT'],
    },
    [PresetTypedChainId.Sepolia]: {
      supportedTokens: ['TNT'],
    },
    [PresetTypedChainId.Polkadot]: {
      supportedTokens: ['tTNT', 'TNT'],
    },
  },
};
