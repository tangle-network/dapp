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
  // TODO: remove this (this is for testing Hyperlane only)
  WETH: {
    id: 'WETH',
    symbol: 'WETH',
    existentialDeposit: {},
    destChainTransactionFee: {},
    decimals: {
      default: 18,
    },
    erc20TokenContractAddress: {
      [PresetTypedChainId.Holesky]:
      '0x94373a4919B3240D86eA41593D5eBa789FEF3848',
      [PresetTypedChainId.TangleTestnetEVM]:
        '0x200DE548e393c38ee80482e9c5c186CBA7096ad4',
    },
    hyperlaneRouteContractAddress: {
      [PresetTypedChainId.Holesky]:
      '0xdFe0fbA0F8C62278DF4A9fDc787F9cFF28522FD3',
      [PresetTypedChainId.TangleTestnetEVM]:
        '0x200DE548e393c38ee80482e9c5c186CBA7096ad4',
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
  [PresetTypedChainId.Holesky]: {
    [PresetTypedChainId.TangleTestnetEVM]: {
      supportedTokens: ['WETH'],
    },
  },
  [PresetTypedChainId.TangleTestnetEVM]: {
    [PresetTypedChainId.Holesky]: {
      supportedTokens: ['WETH'],
    },
  },
};
