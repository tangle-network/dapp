import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { BridgeTokenId, BridgeTokenType, ChainId } from '../types/bridge';

export const BRIDGE_SUPPORTED_TOKENS: Record<BridgeTokenId, BridgeTokenType> = {
  WETH: {
    id: 'WETH',
    symbol: 'WETH',
    existentialDeposit: {},
    destChainTransactionFee: {},
    decimals: {
      default: 18,
    },
    erc20TokenContractAddress: {
      // WETH on Holesky (Not Collateral)
      [PresetTypedChainId.Holesky]:
        '0x94373a4919B3240D86eA41593D5eBa789FEF3848',
      // WETH on Tangle Testnet EVM (Collateral)
      [PresetTypedChainId.TangleTestnetEVM]:
        '0x200DE548e393c38ee80482e9c5c186CBA7096ad4',
    },
    hyperlaneRouteContractAddress: {
      // WETH on Holesky (Collateral)
      [PresetTypedChainId.Holesky]:
        '0xdFe0fbA0F8C62278DF4A9fDc787F9cFF28522FD3',
      // WETH on Tangle Testnet EVM (Collateral)
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
