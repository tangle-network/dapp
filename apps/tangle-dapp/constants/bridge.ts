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
  sygUSD: {
    id: 'sygUSD',
    symbol: 'sygUSD',
    existentialDeposit: {},
    destChainTransactionFee: {},
    decimals: { default: 6, [PresetTypedChainId.Sepolia]: 18 },
    substrateAssetId: {
      [PresetTypedChainId.RococoPhala]: 1984,
      [PresetTypedChainId.TangleTestnetNative]: 2000,
    },
    sygmaResourceId:
      '0x0000000000000000000000000000000000000000000000000000000000001100',
    erc20TokenContractAddress: {
      [PresetTypedChainId.Sepolia]:
        '0xA9F30c6B5E7996D1bAd51D213277c30750bcBB36',
    },
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

export const BRIDGE: BridgeType = {
  [PresetTypedChainId.TangleTestnetNative]: {
    [PresetTypedChainId.Sepolia]: {
      supportedTokens: ['sygUSD'],
    },
    [PresetTypedChainId.RococoPhala]: {
      supportedTokens: ['sygUSD'],
    },
  },
  [PresetTypedChainId.RococoPhala]: {
    [PresetTypedChainId.Sepolia]: {
      supportedTokens: ['sygUSD'],
    },
    [PresetTypedChainId.TangleTestnetNative]: {
      supportedTokens: ['sygUSD'],
    },
  },
  [PresetTypedChainId.Sepolia]: {
    [PresetTypedChainId.RococoPhala]: {
      supportedTokens: ['sygUSD'],
    },
    [PresetTypedChainId.TangleTestnetNative]: {
      supportedTokens: ['sygUSD'],
    },
  },
};
