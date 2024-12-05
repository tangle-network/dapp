import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
  EVMTokens,
} from '@webb-tools/evm-contract-metadata';

import {
  BridgeChainsConfigType,
  BridgeTokenType,
} from '../../types/bridge/types';

export const BRIDGE_TOKENS: Record<PresetTypedChainId, BridgeTokenType[]> = {
  // [PresetTypedChainId.TangleTestnetEVM]: [
  //   {
  //     tokenSymbol: 'hypWETH',
  //     tokenType: EVMTokenEnum.WETH,
  //     bridgeType: EVMTokenBridgeEnum.Hyperlane,
  //     address: EVMTokens.tangletestnet.hyperlane.WETH.address,
  //     abi: EVMTokens.tangletestnet.hyperlane.WETH.abi,
  //     decimals: EVMTokens.tangletestnet.hyperlane.WETH.decimals,
  //   },
  // ],
  // [PresetTypedChainId.Holesky]: [
  //   {
  //     tokenSymbol: 'WETH',
  //     tokenType: EVMTokenEnum.WETH,
  //     bridgeType: EVMTokenBridgeEnum.None,
  //     address: EVMTokens.holesky.none.WETH.address,
  //     abi: EVMTokens.holesky.none.WETH.abi,
  //     decimals: EVMTokens.holesky.none.WETH.decimals,
  //   },
  //   {
  //     tokenSymbol: 'hypWETH',
  //     tokenType: EVMTokenEnum.WETH,
  //     bridgeType: EVMTokenBridgeEnum.Hyperlane,
  //     address: EVMTokens.holesky.hyperlane.WETH.address,
  //     abi: EVMTokens.holesky.hyperlane.WETH.abi,
  //     decimals: EVMTokens.holesky.hyperlane.WETH.decimals,
  //   },
  // ],
  [PresetTypedChainId.EthereumMainNet]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.ethereum.router.TNT.address,
      abi: EVMTokens.ethereum.router.TNT.abi,
      decimals: EVMTokens.ethereum.router.TNT.decimals,
      chainId: PresetTypedChainId.EthereumMainNet,
    },
  ],
  [PresetTypedChainId.Polygon]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.polygon.router.TNT.address,
      abi: EVMTokens.polygon.router.TNT.abi,
      decimals: EVMTokens.polygon.router.TNT.decimals,
      chainId: PresetTypedChainId.Polygon,
    },
  ],
  [PresetTypedChainId.Arbitrum]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.arbitrum.router.TNT.address,
      abi: EVMTokens.arbitrum.router.TNT.abi,
      decimals: EVMTokens.arbitrum.router.TNT.decimals,
      chainId: PresetTypedChainId.Arbitrum,
    },
  ],
  [PresetTypedChainId.Optimism]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.optimism.router.TNT.address,
      abi: EVMTokens.optimism.router.TNT.abi,
      decimals: EVMTokens.optimism.router.TNT.decimals,
      chainId: PresetTypedChainId.Optimism,
    },
  ],
  [PresetTypedChainId.Linea]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.linea.router.TNT.address,
      abi: EVMTokens.linea.router.TNT.abi,
      decimals: EVMTokens.linea.router.TNT.decimals,
      chainId: PresetTypedChainId.Linea,
    },
  ],
  [PresetTypedChainId.Base]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.base.router.TNT.address,
      abi: EVMTokens.base.router.TNT.abi,
      decimals: EVMTokens.base.router.TNT.decimals,
      chainId: PresetTypedChainId.Base,
    },
  ],
  [PresetTypedChainId.BSC]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: EVMTokens.bsc.router.TNT.address,
      abi: EVMTokens.bsc.router.TNT.abi,
      decimals: EVMTokens.bsc.router.TNT.decimals,
      chainId: PresetTypedChainId.BSC,
    },
  ],
};

export const BRIDGE_CHAINS: BridgeChainsConfigType = {
  // [PresetTypedChainId.Holesky]: {
  //   [PresetTypedChainId.TangleTestnetEVM]: {
  //     supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.TangleTestnetEVM],
  //   },
  // },
  // [PresetTypedChainId.TangleTestnetEVM]: {
  //   [PresetTypedChainId.Holesky]: {
  //     supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Holesky],
  //   },
  // },
  [PresetTypedChainId.TangleMainnetEVM]: {
    [PresetTypedChainId.EthereumMainNet]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.EthereumMainNet],
    },
    [PresetTypedChainId.Polygon]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Polygon],
    },
    [PresetTypedChainId.Arbitrum]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Arbitrum],
    },
    [PresetTypedChainId.Optimism]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Optimism],
    },
    [PresetTypedChainId.Linea]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Linea],
    },
    [PresetTypedChainId.Base]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Base],
    },
    [PresetTypedChainId.BSC]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.BSC],
    },
  },
  [PresetTypedChainId.EthereumMainNet]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.EthereumMainNet],
    },
  },
  [PresetTypedChainId.Polygon]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Polygon],
    },
  },
  [PresetTypedChainId.Arbitrum]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Arbitrum],
    },
  },
  [PresetTypedChainId.Optimism]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Optimism],
    },
  },
  [PresetTypedChainId.Linea]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Linea],
    },
  },
  [PresetTypedChainId.Base]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Base],
    },
  },
  [PresetTypedChainId.BSC]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.BSC],
    },
  },
};
