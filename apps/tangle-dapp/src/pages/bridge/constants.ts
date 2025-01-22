import {
  ChainMap,
  ChainMetadata,
  ChainTechnicalStack,
  ExplorerFamily,
  TokenStandard,
  WarpCoreConfig,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
  EVMTokens,
} from '@webb-tools/evm-contract-metadata';

import {
  BridgeChainsConfigType,
  BridgeToken,
} from '@webb-tools/tangle-shared-ui/types';
import {
  assertAddressBy,
  assertEvmAddress,
  isSolanaAddress,
} from '@webb-tools/webb-ui-components';
import { Abi } from 'viem';
import { ERC20_ABI } from './abi';

// TODO: Include assertion logic, as the Abi type can't be directly imported from viem since the 'type' field clashes (string vs. 'function').
const assertAbi = (abi: unknown): Abi => abi as Abi;

export const BRIDGE_TOKENS: Record<PresetTypedChainId, BridgeToken[]> = {
  [PresetTypedChainId.Polygon]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.polygon.router.TNT.address),
      abi: assertAbi(EVMTokens.polygon.router.TNT.abi),
      decimals: EVMTokens.polygon.router.TNT.decimals,
      chainId: PresetTypedChainId.Polygon,
    },
    {
      tokenSymbol: 'USDT',
      tokenType: EVMTokenEnum.USDT,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xF6D2c670ebF3BC82c4Dbd1275f8c35eF80d9cd02'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x3240f00998fe098165b1f8fCaDBaE292e62560aD',
      ),
    },
    {
      tokenSymbol: 'USDC',
      tokenType: EVMTokenEnum.USDC,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7C547f860b71399846E5CC2487f60A2b34396CC2'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x002A0d7Adf2F4A007E0c600EA4Cde65094120122',
      ),
    },
    {
      tokenSymbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7dC9C90Ac46B936F55621C8C8741bd4AC72BC0c2'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x53Df23FD53504208aA53f75b834954b9E3766efa',
      ),
    },
    {
      tokenSymbol: 'DAI',
      tokenType: 'DAI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x05e44F7B2EECB0b2efF11153ef34DCcCbC3D25D7'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xF852cE3E163ae2A2B43f05C6696B50D386ca44d5',
      ),
    },
  ],
  [PresetTypedChainId.Arbitrum]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.arbitrum.router.TNT.address),
      abi: assertAbi(EVMTokens.arbitrum.router.TNT.abi),
      decimals: EVMTokens.arbitrum.router.TNT.decimals,
      chainId: PresetTypedChainId.Arbitrum,
    },
    {
      tokenSymbol: 'USDT',
      tokenType: EVMTokenEnum.USDT,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x0778878E53c632da21cd3951A434a54f418d7CB8'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x1237F64027D3766D4976478b757dac9Ca63e6425',
      ),
    },
    {
      tokenSymbol: 'USDC',
      tokenType: EVMTokenEnum.USDC,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x510b0140a4A5b12c7127fB0A6A946200d66a64C2'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x19b07a373E77bb54ee60A1456EB4412111f0ec0a',
      ),
    },
    {
      tokenSymbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x108F919b5A76B64e80dBf74130Ff6441A62F6405'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xF140e9C0fEa2fbb64B55199F6A7957B3d19FBAB0',
      ),
    },
    {
      tokenSymbol: 'DAI',
      tokenType: 'DAI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7A153C00352DCb87E11684ce504bfE4dC170acCb'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd91CE8398761a85b0989850736619bf0F8b3C76e',
      ),
    },
    {
      tokenSymbol: 'ARB',
      tokenType: 'ARB' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x99Ce18058C6fE35216D8626C3D183526240CcCbb'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xf44511BAFE78CF8DAaa2804d075B40DEFFFe63b2',
      ),
    },
  ],
  [PresetTypedChainId.Optimism]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.optimism.router.TNT.address),
      abi: assertAbi(EVMTokens.optimism.router.TNT.abi),
      decimals: EVMTokens.optimism.router.TNT.decimals,
      chainId: PresetTypedChainId.Optimism,
    },
    {
      tokenSymbol: 'USDT',
      tokenType: EVMTokenEnum.USDT,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xFF2b0Dab4956e69bc2c78542C396EEcD9eAB3460'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC5B342D3CfAd241D9300Cb76116CA4a5e30Cf2Ac',
      ),
    },
    {
      tokenSymbol: 'USDC',
      tokenType: EVMTokenEnum.USDC,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7C547f860b71399846E5CC2487f60A2b34396CC2'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x872E68E6d97bA08840d816229408A4aaAF3e6D4B',
      ),
    },
    {
      tokenSymbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x44Df1A79760f09153Cf31e7bD7F42bE432e30f9C'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC8cCc1cd6B6880353A0aA9a492Ced1972fDEF9c9',
      ),
    },
  ],
  [PresetTypedChainId.Linea]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.linea.router.TNT.address),
      abi: assertAbi(EVMTokens.linea.router.TNT.abi),
      decimals: EVMTokens.linea.router.TNT.decimals,
      chainId: PresetTypedChainId.Linea,
    },
  ],
  [PresetTypedChainId.Base]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.base.router.TNT.address),
      abi: assertAbi(EVMTokens.base.router.TNT.abi),
      decimals: EVMTokens.base.router.TNT.decimals,
      chainId: PresetTypedChainId.Base,
    },
    {
      tokenSymbol: 'USDC',
      tokenType: EVMTokenEnum.USDC,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x8eC690c7b6253a0F834A90E820891BCeC9FA4B3E'),
      abi: assertAbi(ERC20_ABI),
      decimals: 6,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
      ),
    },
    {
      tokenSymbol: 'cbBTC',
      tokenType: 'cbBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xab4E420B21DFa57b103aA09636C1CA88657CDEC7'),
      abi: assertAbi(ERC20_ABI),
      decimals: 8,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x25Bd880dfd52b42242b0ef0d97b5eC66BABa0d01',
      ),
    },
    {
      tokenSymbol: 'AVAIL',
      tokenType: 'AVAIL' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xe2C35423680D0F55F2C226dD75600826f66debA3'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x4b7c2a96d1E9f3D37F979A8c74e17d53473fbf40',
      ),
    },
    {
      tokenSymbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xC3C2bC8664a260d3C60aa91BB3Ea54BfDc705cD6'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x052EDA809Cd496E14DFdE30F039E674A06f5A850',
      ),
    },
  ],
  [PresetTypedChainId.BSC]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.bsc.router.TNT.address),
      abi: assertAbi(EVMTokens.bsc.router.TNT.abi),
      decimals: EVMTokens.bsc.router.TNT.decimals,
      chainId: PresetTypedChainId.BSC,
    },
    {
      tokenSymbol: 'USDT',
      tokenType: EVMTokenEnum.USDT,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xab4E420B21DFa57b103aA09636C1CA88657CDEC7'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.BSC,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xb4c2a9A412d4ae746706CAc8aacf6340EB3D6134',
      ),
    },
    {
      tokenSymbol: 'USDC',
      tokenType: EVMTokenEnum.USDC,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x44E293671560272323423d051191de8AD3b2126b'),
      abi: assertAbi(ERC20_ABI),
      decimals: 18,
      chainId: PresetTypedChainId.BSC,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x88dd0d1DA4155f453a5933310df48Ce7d7fEAbfF',
      ),
    },
  ],
  [PresetTypedChainId.SolanaMainnet]: [
    {
      tokenSymbol: 'routerTNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertAddressBy(
        'FcermohxLgTo8xnJXpPyW6D2swUMepVjQVNiiNLw38pC',
        isSolanaAddress,
      ),
      abi: [],
      decimals: 18,
      chainId: PresetTypedChainId.SolanaMainnet,
    },
  ],
};

export const BRIDGE_CHAINS: BridgeChainsConfigType = {
  [PresetTypedChainId.TangleMainnetEVM]: {
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
    [PresetTypedChainId.SolanaMainnet]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.SolanaMainnet],
    },
  },
  [PresetTypedChainId.Arbitrum]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Arbitrum],
    },
  },
  [PresetTypedChainId.Polygon]: {
    [PresetTypedChainId.TangleMainnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Polygon],
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
  // [PresetTypedChainId.SolanaMainnet]: {
  //   [PresetTypedChainId.TangleMainnetEVM]: {
  //     supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.SolanaMainnet],
  //   },
  // },
};

export const ROUTER_QUOTE_URL = `https://api-beta.pathfinder.routerprotocol.com/api/v2/quote`;

export const ROUTER_TRANSACTION_URL = `https://api-beta.pathfinder.routerprotocol.com/api/v2/transaction`;

export const ROUTER_NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const ROUTER_PARTNER_ID = 252;

export enum ROUTER_ERROR_CODE {
  LOW_AMOUNT_INPUT = 'AMOUNT-LOW-W-VALUE',
}

export const ROUTER_TX_EXPLORER_URL = 'https://explorer.routernitro.com/tx/';

export const HYPERLANE_REGISTRY_URL =
  process.env.NEXT_PUBLIC_HYPERLANE_REGISTRY_URL ||
  'https://github.com/hyperlane-xyz/hyperlane-registry';

export const HYPERLANE_CHAINS: ChainMap<ChainMetadata> = {
  arbitrum: {
    blockExplorers: [
      {
        apiUrl: 'https://api.arbiscan.io/api',
        family: ExplorerFamily.Etherscan,
        name: 'Arbiscan',
        url: 'https://arbiscan.io',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 3,
      reorgPeriod: 5,
    },
    chainId: 42161,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Arbitrum',
    domainId: 42161,
    gasCurrencyCoinGeckoId: 'ethereum',
    gnosisSafeTransactionServiceUrl:
      'https://safe-transaction-arbitrum.safe.global/',
    index: {
      from: 143649797,
    },
    name: 'arbitrum',
    nativeToken: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://arbitrum.llamarpc.com',
      },
      {
        http: 'https://rpc.ankr.com/arbitrum',
      },
      {
        http: 'https://arb1.arbitrum.io/rpc',
      },
    ],
    technicalStack: ChainTechnicalStack.ArbitrumNitro,
  },
  optimism: {
    blockExplorers: [
      {
        apiUrl: 'https://api-optimistic.etherscan.io/api',
        family: ExplorerFamily.Etherscan,
        name: 'Etherscan',
        url: 'https://optimistic.etherscan.io',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 3,
      reorgPeriod: 10,
    },
    chainId: 10,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Optimism',
    domainId: 10,
    gasCurrencyCoinGeckoId: 'ethereum',
    gnosisSafeTransactionServiceUrl:
      'https://safe-transaction-optimism.safe.global/',
    name: 'optimism',
    nativeToken: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://mainnet.optimism.io',
      },
    ],
    technicalStack: ChainTechnicalStack.OpStack,
  },
  polygon: {
    blockExplorers: [
      {
        apiUrl: 'https://api.polygonscan.com/api',
        family: ExplorerFamily.Etherscan,
        name: 'PolygonScan',
        url: 'https://polygonscan.com',
      },
    ],
    blocks: {
      confirmations: 3,
      estimateBlockTime: 2,
      reorgPeriod: 'finalized',
    },
    chainId: 137,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Polygon',
    domainId: 137,
    gasCurrencyCoinGeckoId: 'polygon-ecosystem-token',
    gnosisSafeTransactionServiceUrl:
      'https://safe-transaction-polygon.safe.global/',
    name: 'polygon',
    nativeToken: {
      decimals: 18,
      name: 'Polygon Ecosystem Token',
      symbol: 'POL',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://polygon-bor.publicnode.com',
      },
      {
        http: 'https://polygon-rpc.com',
      },
      {
        http: 'https://rpc.ankr.com/polygon',
      },
    ],
    technicalStack: ChainTechnicalStack.Other,
  },
  bsc: {
    blockExplorers: [
      {
        apiUrl: 'https://api.bscscan.com/api',
        family: ExplorerFamily.Etherscan,
        name: 'BscScan',
        url: 'https://bscscan.com',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 3,
      reorgPeriod: 'finalized',
    },
    chainId: 56,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Binance Smart Chain',
    displayNameShort: 'Binance',
    domainId: 56,
    gasCurrencyCoinGeckoId: 'binancecoin',
    gnosisSafeTransactionServiceUrl:
      'https://safe-transaction-bsc.safe.global/',
    name: 'bsc',
    nativeToken: {
      decimals: 18,
      name: 'BNB',
      symbol: 'BNB',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://rpc.ankr.com/bsc',
      },
      {
        http: 'https://bsc.drpc.org',
      },
      {
        http: 'https://bscrpc.com',
      },
    ],
    technicalStack: ChainTechnicalStack.Other,
  },
  base: {
    blockExplorers: [
      {
        apiUrl: 'https://api.basescan.org/api',
        family: ExplorerFamily.Etherscan,
        name: 'BaseScan',
        url: 'https://basescan.org',
      },
    ],
    blocks: {
      confirmations: 3,
      estimateBlockTime: 2,
      reorgPeriod: 10,
    },
    chainId: 8453,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Base',
    domainId: 8453,
    gasCurrencyCoinGeckoId: 'ethereum',
    gnosisSafeTransactionServiceUrl:
      'https://safe-transaction-base.safe.global/',
    name: 'base',
    nativeToken: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://base.publicnode.com/',
      },
      {
        http: 'https://mainnet.base.org',
      },
      {
        http: 'https://base.blockpi.network/v1/rpc/public',
      },
    ],
    technicalStack: ChainTechnicalStack.Other,
  },
  tangle: {
    blockExplorers: [
      {
        apiUrl: 'https://explorer.tangle.tools/api',
        family: ExplorerFamily.Blockscout,
        name: 'Tangle EVM Explorer',
        url: 'https://explorer.tangle.tools',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 6,
      reorgPeriod: 'finalized',
    },
    chainId: 5845,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Tangle',
    domainId: 5845,
    gasCurrencyCoinGeckoId: 'tangle-network',
    isTestnet: false,
    name: 'tangle',
    nativeToken: {
      decimals: 18,
      name: 'Tangle Network Token',
      symbol: 'TNT',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://rpc.tangle.tools',
      },
    ],
    technicalStack: ChainTechnicalStack.PolkadotSubstrate,
  },
};

export const HYPERLANE_WARP_ROUTE_CONFIGS: WarpCoreConfig = {
  tokens: [
    {
      addressOrDenom: '0x0778878E53c632da21cd3951A434a54f418d7CB8',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      connections: [
        {
          token: 'ethereum|tangle|0x1237F64027D3766D4976478b757dac9Ca63e6425',
        },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x1237F64027D3766D4976478b757dac9Ca63e6425',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x0778878E53c632da21cd3951A434a54f418d7CB8',
        },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0xFF2b0Dab4956e69bc2c78542C396EEcD9eAB3460',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      connections: [
        {
          token: 'ethereum|tangle|0xC5B342D3CfAd241D9300Cb76116CA4a5e30Cf2Ac',
        },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0xC5B342D3CfAd241D9300Cb76116CA4a5e30Cf2Ac',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|optimism|0xFF2b0Dab4956e69bc2c78542C396EEcD9eAB3460',
        },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0xF6D2c670ebF3BC82c4Dbd1275f8c35eF80d9cd02',
      chainName: 'polygon',
      collateralAddressOrDenom: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      connections: [
        {
          token: 'ethereum|tangle|0x3240f00998fe098165b1f8fCaDBaE292e62560aD',
        },
      ],
      decimals: 6,
      name: '(PoS) Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x3240f00998fe098165b1f8fCaDBaE292e62560aD',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|polygon|0xF6D2c670ebF3BC82c4Dbd1275f8c35eF80d9cd02',
        },
      ],
      decimals: 6,
      name: '(PoS) Tether USD',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0xab4E420B21DFa57b103aA09636C1CA88657CDEC7',
      chainName: 'bsc',
      collateralAddressOrDenom: '0x55d398326f99059fF775485246999027B3197955',
      connections: [
        {
          token: 'ethereum|tangle|0xb4c2a9A412d4ae746706CAc8aacf6340EB3D6134',
        },
      ],
      decimals: 18,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0xb4c2a9A412d4ae746706CAc8aacf6340EB3D6134',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|bsc|0xab4E420B21DFa57b103aA09636C1CA88657CDEC7',
        },
      ],
      decimals: 18,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x510b0140a4A5b12c7127fB0A6A946200d66a64C2',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      connections: [
        {
          token: 'ethereum|tangle|0x19b07a373E77bb54ee60A1456EB4412111f0ec0a',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x19b07a373E77bb54ee60A1456EB4412111f0ec0a',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x510b0140a4A5b12c7127fB0A6A946200d66a64C2',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x7C547f860b71399846E5CC2487f60A2b34396CC2',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      connections: [
        {
          token: 'ethereum|tangle|0x002A0d7Adf2F4A007E0c600EA4Cde65094120122',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x002A0d7Adf2F4A007E0c600EA4Cde65094120122',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|polygon|0x7C547f860b71399846E5CC2487f60A2b34396CC2',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x7C547f860b71399846E5CC2487f60A2b34396CC2',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      connections: [
        {
          token: 'ethereum|tangle|0x872E68E6d97bA08840d816229408A4aaAF3e6D4B',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x872E68E6d97bA08840d816229408A4aaAF3e6D4B',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|optimism|0x7C547f860b71399846E5CC2487f60A2b34396CC2',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x8eC690c7b6253a0F834A90E820891BCeC9FA4B3E',
      chainName: 'base',
      collateralAddressOrDenom: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      connections: [
        {
          token: 'ethereum|tangle|0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|base|0x8eC690c7b6253a0F834A90E820891BCeC9FA4B3E',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x44E293671560272323423d051191de8AD3b2126b',
      chainName: 'bsc',
      collateralAddressOrDenom: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      connections: [
        {
          token: 'ethereum|tangle|0x88dd0d1DA4155f453a5933310df48Ce7d7fEAbfF',
        },
      ],
      decimals: 18,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x88dd0d1DA4155f453a5933310df48Ce7d7fEAbfF',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|bsc|0x44E293671560272323423d051191de8AD3b2126b',
        },
      ],
      decimals: 18,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0xab4E420B21DFa57b103aA09636C1CA88657CDEC7',
      chainName: 'base',
      collateralAddressOrDenom: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
      connections: [
        {
          token: 'ethereum|tangle|0x25Bd880dfd52b42242b0ef0d97b5eC66BABa0d01',
        },
      ],
      decimals: 8,
      name: 'Coinbase Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'cbBTC',
    },
    {
      addressOrDenom: '0x25Bd880dfd52b42242b0ef0d97b5eC66BABa0d01',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|base|0xab4E420B21DFa57b103aA09636C1CA88657CDEC7',
        },
      ],
      decimals: 8,
      name: 'Coinbase Wrapped BTC',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'cbBTC',
    },
    {
      addressOrDenom: '0xe2C35423680D0F55F2C226dD75600826f66debA3',
      chainName: 'base',
      collateralAddressOrDenom: '0xd89d90d26B48940FA8F58385Fe84625d468E057a',
      connections: [
        {
          token: 'ethereum|tangle|0x4b7c2a96d1E9f3D37F979A8c74e17d53473fbf40',
        },
      ],
      decimals: 18,
      name: 'Avail (Wormhole)',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'AVAIL',
    },
    {
      addressOrDenom: '0x4b7c2a96d1E9f3D37F979A8c74e17d53473fbf40',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|base|0xe2C35423680D0F55F2C226dD75600826f66debA3',
        },
      ],
      decimals: 18,
      name: 'Avail (Wormhole)',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'AVAIL',
    },
    {
      addressOrDenom: '0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x5979D7b546E38E414F7E9822514be443A4800529',
      connections: [
        {
          token: 'ethereum|tangle|0xF140e9C0fEa2fbb64B55199F6A7957B3d19FBAB0',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0xF140e9C0fEa2fbb64B55199F6A7957B3d19FBAB0',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x7dC9C90Ac46B936F55621C8C8741bd4AC72BC0c2',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD',
      connections: [
        {
          token: 'ethereum|tangle|0x53Df23FD53504208aA53f75b834954b9E3766efa',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0 (PoS)',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x53Df23FD53504208aA53f75b834954b9E3766efa',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|polygon|0x7dC9C90Ac46B936F55621C8C8741bd4AC72BC0c2',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0 (PoS)',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0xC3C2bC8664a260d3C60aa91BB3Ea54BfDc705cD6',
      chainName: 'base',
      collateralAddressOrDenom: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
      connections: [
        {
          token: 'ethereum|tangle|0x052EDA809Cd496E14DFdE30F039E674A06f5A850',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x052EDA809Cd496E14DFdE30F039E674A06f5A850',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|base|0xC3C2bC8664a260d3C60aa91BB3Ea54BfDc705cD6',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x44Df1A79760f09153Cf31e7bD7F42bE432e30f9C',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      connections: [
        {
          token: 'ethereum|tangle|0xC8cCc1cd6B6880353A0aA9a492Ced1972fDEF9c9',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0xC8cCc1cd6B6880353A0aA9a492Ced1972fDEF9c9',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|optimism|0x44Df1A79760f09153Cf31e7bD7F42bE432e30f9C',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      connections: [
        {
          token: 'ethereum|tangle|0xd91CE8398761a85b0989850736619bf0F8b3C76e',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0xd91CE8398761a85b0989850736619bf0F8b3C76e',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0x05e44F7B2EECB0b2efF11153ef34DCcCbC3D25D7',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      connections: [
        {
          token: 'ethereum|tangle|0xF852cE3E163ae2A2B43f05C6696B50D386ca44d5',
        },
      ],
      decimals: 18,
      name: '(PoS) Dai Stablecoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0xF852cE3E163ae2A2B43f05C6696B50D386ca44d5',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|polygon|0x05e44F7B2EECB0b2efF11153ef34DCcCbC3D25D7',
        },
      ],
      decimals: 18,
      name: '(PoS) Dai Stablecoin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      connections: [
        {
          token: 'ethereum|tangle|0xf44511BAFE78CF8DAaa2804d075B40DEFFFe63b2',
        },
      ],
      decimals: 18,
      name: 'Arbitrum',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'ARB',
    },
    {
      addressOrDenom: '0xf44511BAFE78CF8DAaa2804d075B40DEFFFe63b2',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
        },
      ],
      decimals: 18,
      name: 'Arbitrum',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'ARB',
    },
  ],
};

export const HYPERLANE_WARP_ROUTE_WHITELIST: Array<string> | null = [
  'USDT/arbitrum-tangle',
  'USDT/optimism-tangle',
  'USDT/polygon-tangle',
  'USDT/bsc-tangle',
  'USDC/arbitrum-tangle',
  'USDC/polygon-tangle',
  'USDC/optimism-tangle',
  'USDC/base-tangle',
  'USDC/bsc-tangle',
  'cbBTC/base-tangle',
  'AVAIL/base-tangle',
  'wstETH/arbitrum-tangle',
  'wstETH/polygon-tangle',
  'wstETH/optimism-tangle',
  'DAI/arbitrum-tangle',
  'DAI/polygon-tangle',
];
