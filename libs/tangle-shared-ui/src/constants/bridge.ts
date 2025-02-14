import {
  ChainMap,
  ChainMetadata,
  ChainTechnicalStack,
  ExplorerFamily,
  TokenStandard,
  WarpCoreConfig,
} from '@hyperlane-xyz/sdk';
import { ProtocolType } from '@hyperlane-xyz/utils';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
  EVMTokens,
} from '@tangle-network/evm-contract-metadata';

import { assertEvmAddress } from '@tangle-network/ui-components';
import { Abi, erc20Abi } from 'viem';
import { BridgeChainsConfigType, BridgeToken } from '../types';

// TODO: Include assertion logic, as the Abi type can't be directly imported from viem since the 'type' field clashes (string vs. 'function').
const assertAbi = (abi: unknown): Abi => abi as Abi;

export const BRIDGE_TOKENS: Record<PresetTypedChainId, BridgeToken[]> = {
  [PresetTypedChainId.Polygon]: [
    {
      symbol: 'TNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.polygon.router.TNT.address),
      abi: assertAbi(EVMTokens.polygon.router.TNT.abi),
      decimals: EVMTokens.polygon.router.TNT.decimals,
      chainId: PresetTypedChainId.Polygon,
    },
    {
      symbol: 'CRV',
      tokenType: 'CRV' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x3DBBB4fdC5725FF780E653FfC3Af427029C259F3'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
      ),
    },
    {
      symbol: 'DAI',
      tokenType: 'DAI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x215fF6c8C9FdC3a8635F2343112B7b5aA8194789'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
      ),
    },
    {
      symbol: 'LDO',
      tokenType: 'LDO' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x99829129a49517FAc964802cA30E75Fd96143dC2'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x94AB056b6CF81464458d205E632b2757A311E821',
      ),
    },
    {
      symbol: 'LINK',
      tokenType: 'LINK' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xfeE0B3295D2f7e209217F33FDb46e79D6b3C15C7'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
      ),
    },
    {
      symbol: 'POL',
      tokenType: 'POL' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xCdb39557fa155Ff98d11739B6A5F687E7Cb922d8'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x160F5cD345Db235C92B671782d27F5aA6F2f31EB',
      ),
    },
    {
      symbol: 'rETH',
      tokenType: 'rETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x158C33834acf0B3d061DdFA1C7784cA595AC1c25'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xbD33235a960874027ad0C7393BE8583572EE2f5b',
      ),
    },
    {
      symbol: 'tBTC',
      tokenType: 'tBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xF46496DD3eFdbb6Bf69cdEee56aBd17AAC8A0494'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241',
      ),
    },
    {
      symbol: 'UNI',
      tokenType: 'UNI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82',
      ),
    },
    {
      symbol: 'USDC',
      tokenType: 'USDC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xf041B44EE24B5358D0999076933675fF5baCa437'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa',
      ),
    },
    {
      symbol: 'USDT',
      tokenType: 'USDT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x72141B45a23333011AaAb07D6fDEBbE97049091e'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xa06898e779998eC3a749368DF924d5b94C2465b4',
      ),
    },
    {
      symbol: 'WBTC',
      tokenType: 'WBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x0E7f434f502200ec7BEb04Ed6B38DFaf0aD88617'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
      ),
    },
    {
      symbol: 'WETH',
      tokenType: 'WETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x0fB3F8e01fAEf0eBC1E56F34E58BA3edCe75B116'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52',
      ),
    },
    {
      symbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x5180c082e7E438c80cF4235C098C8CB0a7c3E3FD'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Polygon,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48',
      ),
    },
  ],
  [PresetTypedChainId.Arbitrum]: [
    {
      symbol: 'TNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.arbitrum.router.TNT.address),
      abi: assertAbi(EVMTokens.arbitrum.router.TNT.abi),
      decimals: EVMTokens.arbitrum.router.TNT.decimals,
      chainId: PresetTypedChainId.Arbitrum,
    },
    {
      symbol: 'ARB',
      tokenType: 'ARB' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x99Ce18058C6fE35216D8626C3D183526240CcCbb'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xf44511BAFE78CF8DAaa2804d075B40DEFFFe63b2',
      ),
    },
    {
      symbol: 'cbBTC',
      tokenType: 'cbBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xD5B8441E2929e73f1e9a9C53b7a6863780897FFa'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xFa0C5466EF2D1C6b4C769c8a3BaABD9e9107a6f7',
      ),
    },
    {
      symbol: 'cbETH',
      tokenType: 'cbETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x77dfB661ee20af4F0C48E4d31828efC34D9a93C6'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x74CBCBa1125ec200cc63efF432B462A084E557cc',
      ),
    },
    {
      symbol: 'CRV',
      tokenType: 'CRV' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
      ),
    },
    {
      symbol: 'DAI',
      tokenType: 'DAI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
      ),
    },
    {
      symbol: 'ETH',
      tokenType: 'ETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x68AbCC37de2BEb083Cd6A549f64C3494Ea418BB7'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7',
      ),
    },
    {
      symbol: 'ezETH',
      tokenType: 'ezETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7CFc15E7fD3998B962D1FC137b64d10513c18097'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x536889B3c998D36911BA73411F502662B0754684',
      ),
    },
    {
      symbol: 'LDO',
      tokenType: 'LDO' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xd311608Ca8b12d3cce99D9318bc38b4BCcBdE11d'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x94AB056b6CF81464458d205E632b2757A311E821',
      ),
    },
    {
      symbol: 'LINK',
      tokenType: 'LINK' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x0251Bdc4cd9226B369859fd75D5be133EF48e7D9'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
      ),
    },
    {
      symbol: 'rETH',
      tokenType: 'rETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xB6e1965e8c13657e25450F0161eebAD8F2b2FC0E'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xbD33235a960874027ad0C7393BE8583572EE2f5b',
      ),
    },
    {
      symbol: 'SolvBTC',
      tokenType: 'SolvBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xc80f2Bd6Bc9C74a6674bC0A0966e76a5eAC51Cf7'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
      ),
    },
    {
      symbol: 'SolvBTC.BBN',
      tokenType: 'SolvBTC.BBN' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x122c216D5379376413Fc7B547598AcD5268A57B4'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xF0120960A6D667460F21f88778cb5e44cb90Ac3d',
      ),
    },
    {
      symbol: 'swETH',
      tokenType: 'swETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x15BC1c8861def0e6605685bFEdF3A6456f068dBa'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x28ce5Ab9E7b4B04f146E3Ca5E3cb87D7b07d5497',
      ),
    },
    {
      symbol: 'tBTC',
      tokenType: 'tBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x1654A5e254277FB66773eb4B0E428efB0bFB3Dca'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241',
      ),
    },
    {
      symbol: 'UNI',
      tokenType: 'UNI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82',
      ),
    },
    {
      symbol: 'USDC',
      tokenType: 'USDC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xd7405f4396a90cD6B1f11f172F08034dBd9265D8'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa',
      ),
    },
    {
      symbol: 'USDT',
      tokenType: 'USDT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x5b6C0685Fc934C53b4523Bf8df5277dC4f3914FA'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xa06898e779998eC3a749368DF924d5b94C2465b4',
      ),
    },
    {
      symbol: 'USDX',
      tokenType: 'USDX' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x4139b8F1474FFd04EE15F86103EF53f8Fdb3d8D0'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x04667a82F593d55aa34CE38B204Ec0Fdc54cDe0C',
      ),
    },
    {
      symbol: 'WBTC',
      tokenType: 'WBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x44626462ed716DF3569a55c3584CEe2027d061bf'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
      ),
    },
    {
      symbol: 'WETH',
      tokenType: 'WETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x02644D01979CDe915eD7D7C3a997072F5716D137'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52',
      ),
    },
    {
      symbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Arbitrum,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48',
      ),
    },
  ],
  [PresetTypedChainId.Optimism]: [
    {
      symbol: 'TNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.optimism.router.TNT.address),
      abi: assertAbi(EVMTokens.optimism.router.TNT.abi),
      decimals: EVMTokens.optimism.router.TNT.decimals,
      chainId: PresetTypedChainId.Optimism,
    },
    {
      symbol: 'cbETH',
      tokenType: 'cbETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x61F71B85762c8848083506da347969c58248f0c6'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x74CBCBa1125ec200cc63efF432B462A084E557cc',
      ),
    },
    {
      symbol: 'CRV',
      tokenType: 'CRV' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
      ),
    },
    {
      symbol: 'DAI',
      tokenType: 'DAI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x6d55528963D147BEA3e925538F2e32C24Fa0119a'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
      ),
    },
    {
      symbol: 'ETH',
      tokenType: 'ETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x96d4357EB200f230816811b4320259b2f9228D5c'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7',
      ),
    },
    {
      symbol: 'ezETH',
      tokenType: 'ezETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xb794b059bDA36a01C3757693D4136162752e03C6'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x536889B3c998D36911BA73411F502662B0754684',
      ),
    },
    {
      symbol: 'LDO',
      tokenType: 'LDO' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x87228bCa8bdB5F3c1EafDddCC14a059Bcde2233b'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x94AB056b6CF81464458d205E632b2757A311E821',
      ),
    },
    {
      symbol: 'LINK',
      tokenType: 'LINK' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7a6BB435590eab856cA0b19EF5bFC227346f0f96'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
      ),
    },
    {
      symbol: 'OP',
      tokenType: 'OP' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x3fD392c4b9c8ceD4bA003115A7803D0Fa0c6718B'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x117Ea1d145787472C368aB427ae9A4B0b5B8CEe9',
      ),
    },
    {
      symbol: 'rETH',
      tokenType: 'rETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xEF783f54b69554f0A3c7263DF508A395febb407b'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xbD33235a960874027ad0C7393BE8583572EE2f5b',
      ),
    },
    {
      symbol: 'tBTC',
      tokenType: 'tBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x5742195A81349F1306361D71A050C4cDdC5814FE'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241',
      ),
    },
    {
      symbol: 'UNI',
      tokenType: 'UNI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x25Eb364cb96485c22eE70a6cfc60717F0C0b3380'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82',
      ),
    },
    {
      symbol: 'USDC',
      tokenType: 'USDC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x7A153C00352DCb87E11684ce504bfE4dC170acCb'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa',
      ),
    },
    {
      symbol: 'USDT',
      tokenType: 'USDT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x108F919b5A76B64e80dBf74130Ff6441A62F6405'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xa06898e779998eC3a749368DF924d5b94C2465b4',
      ),
    },
    {
      symbol: 'WBTC',
      tokenType: 'WBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xDCb6a0a3bC5e034400e845483f21da67866691Bb'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
      ),
    },
    {
      symbol: 'WETH',
      tokenType: 'WETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x677952E2ff8c5Fb2F2455a84AC70208f4c3d7810'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52',
      ),
    },
    {
      symbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x99Ce18058C6fE35216D8626C3D183526240CcCbb'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Optimism,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48',
      ),
    },
  ],
  [PresetTypedChainId.Linea]: [
    {
      symbol: 'TNT',
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
      symbol: 'TNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.base.router.TNT.address),
      abi: assertAbi(EVMTokens.base.router.TNT.abi),
      decimals: EVMTokens.base.router.TNT.decimals,
      chainId: PresetTypedChainId.Base,
    },
    {
      symbol: 'AVAIL',
      tokenType: 'AVAIL' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xe2C35423680D0F55F2C226dD75600826f66debA3'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x4b7c2a96d1E9f3D37F979A8c74e17d53473fbf40',
      ),
    },
    {
      symbol: 'cbBTC',
      tokenType: 'cbBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x07a4568A98621f90E7D94E87D7e9Bf806d5E19f3'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xFa0C5466EF2D1C6b4C769c8a3BaABD9e9107a6f7',
      ),
    },
    {
      symbol: 'cbETH',
      tokenType: 'cbETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x74CBCBa1125ec200cc63efF432B462A084E557cc',
      ),
    },
    {
      symbol: 'CRV',
      tokenType: 'CRV' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xAf461f35C12d207ee533191C89B476CCB1b03D60'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
      ),
    },
    {
      symbol: 'DAI',
      tokenType: 'DAI' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xfB03a8fEea1635c16Fd81731E89E5517201C20e5'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
      ),
    },
    {
      symbol: 'ETH',
      tokenType: 'ETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x61F71B85762c8848083506da347969c58248f0c6'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7',
      ),
    },
    {
      symbol: 'ezETH',
      tokenType: 'ezETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xCa965b842699e16b367702310f50161e03eb2d27'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x536889B3c998D36911BA73411F502662B0754684',
      ),
    },
    {
      symbol: 'LBTC',
      tokenType: 'LBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xB703e29F2b05c57Fbc2E3492bE5fC6Db62CE3188',
      ),
    },
    {
      symbol: 'LINK',
      tokenType: 'LINK' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xB922779bB836765598709032736C86c67E5A514e'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
      ),
    },
    {
      symbol: 'rETH',
      tokenType: 'rETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xb2434BA552d88e026c1D339CFE8c827d98A626b9'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xbD33235a960874027ad0C7393BE8583572EE2f5b',
      ),
    },
    {
      symbol: 'stAVAIL',
      tokenType: 'stAVAIL' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xcC1579deEE9Fd67B3F73EBA8CF2e113bcb59515C'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xb0b1cb358f4597838859edA7dac076ada0E8aA34',
      ),
    },
    {
      symbol: 'tBTC',
      tokenType: 'tBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x21F0ba9E292e1FE8A1C723C8dc3D0bf782b3d75E'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241',
      ),
    },
    {
      symbol: 'USDC',
      tokenType: 'USDC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xf041B44EE24B5358D0999076933675fF5baCa437'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa',
      ),
    },
    {
      symbol: 'USDT',
      tokenType: 'USDT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x72141B45a23333011AaAb07D6fDEBbE97049091e'),
      abi: assertAbi(erc20Abi),
      decimals: 6,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xa06898e779998eC3a749368DF924d5b94C2465b4',
      ),
    },
    {
      symbol: 'WBTC',
      tokenType: 'WBTC' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x989Ecb4dB2543b694b7496f5823DA6fDd26cb5C5'),
      abi: assertAbi(erc20Abi),
      decimals: 8,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
      ),
    },
    {
      symbol: 'WETH',
      tokenType: 'WETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xAa14351a1FdD71f5Fdf3653AF0130f79fC005F6f'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52',
      ),
    },
    {
      symbol: 'wstETH',
      tokenType: 'wstETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x451c6284eEA043Fa3969bA65530E96421C89bF9b'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Base,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48',
      ),
    },
  ],
  [PresetTypedChainId.BSC]: [
    {
      symbol: 'TNT',
      tokenType: EVMTokenEnum.TNT,
      bridgeType: EVMTokenBridgeEnum.Router,
      address: assertEvmAddress(EVMTokens.bsc.router.TNT.address),
      abi: assertAbi(EVMTokens.bsc.router.TNT.abi),
      decimals: EVMTokens.bsc.router.TNT.decimals,
      chainId: PresetTypedChainId.BSC,
    },
    {
      symbol: 'BNB',
      tokenType: 'BNB' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x510b0140a4A5b12c7127fB0A6A946200d66a64C2'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.BSC,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x7497aDa0D9761ce5fc5965dDF926810BEfDDEA4d',
      ),
    },
  ],
  [PresetTypedChainId.Holesky]: [
    {
      symbol: 'LDT',
      tokenType: 'LDT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x488A2E673B0bA9876788A7497c331EfaA14d5F81'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Holesky,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x122c216D5379376413Fc7B547598AcD5268A57B4',
      ),
      isTestnet: true,
    },
    {
      symbol: 'MMT',
      tokenType: 'MMT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0xc0CB548E329A9Fb2431E651E8e0B3269aD6F1D22'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Holesky,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xbd6651dd0DAe09818baA8950430D139BD0D899ff',
      ),
      isTestnet: true,
    },
    {
      symbol: 'CPT',
      tokenType: 'CPT' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x75F277a14bBe7020aaBd62c482c38391FB09E0ba'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Holesky,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0xc0CB548E329A9Fb2431E651E8e0B3269aD6F1D22',
      ),
      isTestnet: true,
    },
    {
      symbol: 'WETH',
      tokenType: 'WETH' as EVMTokenEnum,
      bridgeType: EVMTokenBridgeEnum.Hyperlane,
      address: assertEvmAddress('0x777053A78AaB486A57A4e09d8FF48Fbb989564dE'),
      abi: assertAbi(erc20Abi),
      decimals: 18,
      chainId: PresetTypedChainId.Holesky,
      hyperlaneSyntheticAddress: assertEvmAddress(
        '0x75F277a14bBe7020aaBd62c482c38391FB09E0ba',
      ),
      isTestnet: true,
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
  [PresetTypedChainId.Holesky]: {
    [PresetTypedChainId.TangleTestnetEVM]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Holesky],
    },
  },
  [PresetTypedChainId.TangleTestnetEVM]: {
    [PresetTypedChainId.Holesky]: {
      supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.Holesky],
    },
  },
  // [PresetTypedChainId.SolanaMainnet]: {
  //   [PresetTypedChainId.TangleMainnetEVM]: {
  //     supportedTokens: BRIDGE_TOKENS[PresetTypedChainId.SolanaMainnet],
  //   },
  // },
};

export const ROUTER_QUOTE_URL = `https://api-beta.pathfinder.routerprotocol.com/api/v2/quote`;

export const ROUTER_TX_STATUS_URL = `https://api-beta.pathfinder.routerprotocol.com/api/v2/status`;

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
  holesky: {
    blockExplorers: [
      {
        apiUrl: 'https://api-holesky.etherscan.io/api',
        family: ExplorerFamily.Etherscan,
        name: 'Etherscan',
        url: 'https://holesky.etherscan.io',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 13,
      reorgPeriod: 2,
    },
    chainId: 17000,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Holesky',
    domainId: 17000,
    gasCurrencyCoinGeckoId: 'ethereum',
    isTestnet: true,
    name: 'holesky',
    nativeToken: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://ethereum-holesky-rpc.publicnode.com',
      },
    ],
  },
  tangletestnet: {
    blockExplorers: [
      {
        apiUrl: 'https://testnet-explorer.tangle.tools/api',
        family: ExplorerFamily.Blockscout,
        name: 'Tangle Test Network Explorer',
        url: 'https://testnet-explorer.tangle.tools/',
      },
    ],
    blocks: {
      confirmations: 1,
      estimateBlockTime: 6,
      reorgPeriod: 0,
    },
    chainId: 3799,
    deployer: {
      name: 'Abacus Works',
      url: 'https://www.hyperlane.xyz',
    },
    displayName: 'Tangle Testnet',
    domainId: 3799,
    isTestnet: true,
    name: 'tangletestnet',
    nativeToken: {
      decimals: 18,
      name: 'Tangle Network Token',
      symbol: 'tTNT',
    },
    protocol: ProtocolType.Ethereum,
    rpcUrls: [
      {
        http: 'https://testnet-rpc.tangle.tools',
      },
    ],
  },
};

export const HYPERLANE_WARP_ROUTE_CONFIGS: WarpCoreConfig = {
  tokens: [
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
      addressOrDenom: '0x510b0140a4A5b12c7127fB0A6A946200d66a64C2',
      chainName: 'bsc',
      connections: [
        {
          token: 'ethereum|tangle|0x7497aDa0D9761ce5fc5965dDF926810BEfDDEA4d',
        },
      ],
      decimals: 18,
      name: 'BNB',
      standard: TokenStandard.EvmHypNative,
      symbol: 'BNB',
    },
    {
      addressOrDenom: '0x7497aDa0D9761ce5fc5965dDF926810BEfDDEA4d',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|bsc|0x510b0140a4A5b12c7127fB0A6A946200d66a64C2',
        },
      ],
      decimals: 18,
      name: 'BNB',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'BNB',
    },
    {
      addressOrDenom: '0xD5B8441E2929e73f1e9a9C53b7a6863780897FFa',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
      connections: [
        {
          token: 'ethereum|base|0x07a4568A98621f90E7D94E87D7e9Bf806d5E19f3',
        },
        {
          token: 'ethereum|tangle|0xFa0C5466EF2D1C6b4C769c8a3BaABD9e9107a6f7',
        },
      ],
      decimals: 8,
      name: 'Coinbase Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'cbBTC',
    },
    {
      addressOrDenom: '0x07a4568A98621f90E7D94E87D7e9Bf806d5E19f3',
      chainName: 'base',
      collateralAddressOrDenom: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
      connections: [
        {
          token: 'ethereum|arbitrum|0xD5B8441E2929e73f1e9a9C53b7a6863780897FFa',
        },
        {
          token: 'ethereum|tangle|0xFa0C5466EF2D1C6b4C769c8a3BaABD9e9107a6f7',
        },
      ],
      decimals: 8,
      name: 'Coinbase Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'cbBTC',
    },
    {
      addressOrDenom: '0xFa0C5466EF2D1C6b4C769c8a3BaABD9e9107a6f7',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xD5B8441E2929e73f1e9a9C53b7a6863780897FFa',
        },
        {
          token: 'ethereum|base|0x07a4568A98621f90E7D94E87D7e9Bf806d5E19f3',
        },
      ],
      decimals: 8,
      name: 'Coinbase Wrapped BTC',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'cbBTC',
    },
    {
      addressOrDenom: '0x77dfB661ee20af4F0C48E4d31828efC34D9a93C6',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x1DEBd73E752bEaF79865Fd6446b0c970EaE7732f',
      connections: [
        {
          token: 'ethereum|base|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|optimism|0x61F71B85762c8848083506da347969c58248f0c6',
        },
        {
          token: 'ethereum|tangle|0x74CBCBa1125ec200cc63efF432B462A084E557cc',
        },
      ],
      decimals: 18,
      name: 'Coinbase Wrapped Staked ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'cbETH',
    },
    {
      addressOrDenom: '0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
      chainName: 'base',
      collateralAddressOrDenom: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
      connections: [
        {
          token: 'ethereum|arbitrum|0x77dfB661ee20af4F0C48E4d31828efC34D9a93C6',
        },
        {
          token: 'ethereum|optimism|0x61F71B85762c8848083506da347969c58248f0c6',
        },
        {
          token: 'ethereum|tangle|0x74CBCBa1125ec200cc63efF432B462A084E557cc',
        },
      ],
      decimals: 18,
      name: 'Coinbase Wrapped Staked ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'cbETH',
    },
    {
      addressOrDenom: '0x61F71B85762c8848083506da347969c58248f0c6',
      chainName: 'optimism',
      collateralAddressOrDenom: '0xadDb6A0412DE1BA0F936DCaeb8Aaa24578dcF3B2',
      connections: [
        {
          token: 'ethereum|arbitrum|0x77dfB661ee20af4F0C48E4d31828efC34D9a93C6',
        },
        {
          token: 'ethereum|base|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|tangle|0x74CBCBa1125ec200cc63efF432B462A084E557cc',
        },
      ],
      decimals: 18,
      name: 'Coinbase Wrapped Staked ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'cbETH',
    },
    {
      addressOrDenom: '0x74CBCBa1125ec200cc63efF432B462A084E557cc',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x77dfB661ee20af4F0C48E4d31828efC34D9a93C6',
        },
        {
          token: 'ethereum|base|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|optimism|0x61F71B85762c8848083506da347969c58248f0c6',
        },
      ],
      decimals: 18,
      name: 'Coinbase Wrapped Staked ETH',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'cbETH',
    },
    {
      addressOrDenom: '0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
      connections: [
        {
          token: 'ethereum|base|0xAf461f35C12d207ee533191C89B476CCB1b03D60',
        },
        {
          token: 'ethereum|optimism|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|polygon|0x3DBBB4fdC5725FF780E653FfC3Af427029C259F3',
        },
        {
          token: 'ethereum|tangle|0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
        },
      ],
      decimals: 18,
      name: 'Curve DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'CRV',
    },
    {
      addressOrDenom: '0xAf461f35C12d207ee533191C89B476CCB1b03D60',
      chainName: 'base',
      collateralAddressOrDenom: '0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415',
      connections: [
        {
          token: 'ethereum|arbitrum|0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
        },
        {
          token: 'ethereum|optimism|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|polygon|0x3DBBB4fdC5725FF780E653FfC3Af427029C259F3',
        },
        {
          token: 'ethereum|tangle|0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
        },
      ],
      decimals: 18,
      name: 'Curve DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'CRV',
    },
    {
      addressOrDenom: '0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53',
      connections: [
        {
          token: 'ethereum|arbitrum|0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
        },
        {
          token: 'ethereum|base|0xAf461f35C12d207ee533191C89B476CCB1b03D60',
        },
        {
          token: 'ethereum|polygon|0x3DBBB4fdC5725FF780E653FfC3Af427029C259F3',
        },
        {
          token: 'ethereum|tangle|0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
        },
      ],
      decimals: 18,
      name: 'Curve DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'CRV',
    },
    {
      addressOrDenom: '0x3DBBB4fdC5725FF780E653FfC3Af427029C259F3',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
      connections: [
        {
          token: 'ethereum|arbitrum|0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
        },
        {
          token: 'ethereum|base|0xAf461f35C12d207ee533191C89B476CCB1b03D60',
        },
        {
          token: 'ethereum|optimism|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|tangle|0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
        },
      ],
      decimals: 18,
      name: 'Curve DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'CRV',
    },
    {
      addressOrDenom: '0xED8Ef3eF3965f64A143977eB641BA2212DCfC96e',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
        },
        {
          token: 'ethereum|base|0xAf461f35C12d207ee533191C89B476CCB1b03D60',
        },
        {
          token: 'ethereum|optimism|0xb0cB96127e4C4bE884F71c9CF2BbbFf897271e76',
        },
        {
          token: 'ethereum|polygon|0x3DBBB4fdC5725FF780E653FfC3Af427029C259F3',
        },
      ],
      decimals: 18,
      name: 'Curve DAO Token',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'CRV',
    },
    {
      addressOrDenom: '0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      connections: [
        {
          token: 'ethereum|base|0xfB03a8fEea1635c16Fd81731E89E5517201C20e5',
        },
        {
          token: 'ethereum|optimism|0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
        },
        {
          token: 'ethereum|polygon|0x215fF6c8C9FdC3a8635F2343112B7b5aA8194789',
        },
        {
          token: 'ethereum|tangle|0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0xfB03a8fEea1635c16Fd81731E89E5517201C20e5',
      chainName: 'base',
      collateralAddressOrDenom: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      connections: [
        {
          token: 'ethereum|arbitrum|0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
        },
        {
          token: 'ethereum|optimism|0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
        },
        {
          token: 'ethereum|polygon|0x215fF6c8C9FdC3a8635F2343112B7b5aA8194789',
        },
        {
          token: 'ethereum|tangle|0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
      chainName: 'optimism',
      collateralAddressOrDenom: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      connections: [
        {
          token: 'ethereum|arbitrum|0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
        },
        {
          token: 'ethereum|base|0xfB03a8fEea1635c16Fd81731E89E5517201C20e5',
        },
        {
          token: 'ethereum|polygon|0x215fF6c8C9FdC3a8635F2343112B7b5aA8194789',
        },
        {
          token: 'ethereum|tangle|0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0x215fF6c8C9FdC3a8635F2343112B7b5aA8194789',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      connections: [
        {
          token: 'ethereum|arbitrum|0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
        },
        {
          token: 'ethereum|base|0xfB03a8fEea1635c16Fd81731E89E5517201C20e5',
        },
        {
          token: 'ethereum|optimism|0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
        },
        {
          token: 'ethereum|tangle|0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0xE75BE8E6C71eA004949898306DDa9BD59Cc2b0dC',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
        },
        {
          token: 'ethereum|base|0xfB03a8fEea1635c16Fd81731E89E5517201C20e5',
        },
        {
          token: 'ethereum|optimism|0x6d55528963D147BEA3e925538F2e32C24Fa0119a',
        },
        {
          token: 'ethereum|polygon|0x215fF6c8C9FdC3a8635F2343112B7b5aA8194789',
        },
      ],
      decimals: 18,
      name: 'Dai Stablecoin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'DAI',
    },
    {
      addressOrDenom: '0x68AbCC37de2BEb083Cd6A549f64C3494Ea418BB7',
      chainName: 'arbitrum',
      connections: [
        { token: 'ethereum|base|0x61F71B85762c8848083506da347969c58248f0c6' },
        {
          token: 'ethereum|optimism|0x96d4357EB200f230816811b4320259b2f9228D5c',
        },
        { token: 'ethereum|tangle|0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7' },
      ],
      decimals: 18,
      name: 'Ether',
      standard: TokenStandard.EvmHypNative,
      symbol: 'ETH',
    },
    {
      addressOrDenom: '0x61F71B85762c8848083506da347969c58248f0c6',
      chainName: 'base',
      connections: [
        {
          token: 'ethereum|arbitrum|0x68AbCC37de2BEb083Cd6A549f64C3494Ea418BB7',
        },
        {
          token: 'ethereum|optimism|0x96d4357EB200f230816811b4320259b2f9228D5c',
        },
        { token: 'ethereum|tangle|0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7' },
      ],
      decimals: 18,
      name: 'Ether',
      standard: TokenStandard.EvmHypNative,
      symbol: 'ETH',
    },
    {
      addressOrDenom: '0x96d4357EB200f230816811b4320259b2f9228D5c',
      chainName: 'optimism',
      connections: [
        {
          token: 'ethereum|arbitrum|0x68AbCC37de2BEb083Cd6A549f64C3494Ea418BB7',
        },
        { token: 'ethereum|base|0x61F71B85762c8848083506da347969c58248f0c6' },
        { token: 'ethereum|tangle|0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7' },
      ],
      decimals: 18,
      name: 'Ether',
      standard: TokenStandard.EvmHypNative,
      symbol: 'ETH',
    },
    {
      addressOrDenom: '0x6341d878A7f8D1872D8EA6f10e15E89692DC7cd7',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x68AbCC37de2BEb083Cd6A549f64C3494Ea418BB7',
        },
        { token: 'ethereum|base|0x61F71B85762c8848083506da347969c58248f0c6' },
        {
          token: 'ethereum|optimism|0x96d4357EB200f230816811b4320259b2f9228D5c',
        },
      ],
      decimals: 18,
      name: 'Ether',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'ETH',
    },
    {
      addressOrDenom: '0x7CFc15E7fD3998B962D1FC137b64d10513c18097',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x2416092f143378750bb29b79eD961ab195CcEea5',
      connections: [
        { token: 'ethereum|base|0xCa965b842699e16b367702310f50161e03eb2d27' },
        {
          token: 'ethereum|optimism|0xb794b059bDA36a01C3757693D4136162752e03C6',
        },
        { token: 'ethereum|tangle|0x536889B3c998D36911BA73411F502662B0754684' },
      ],
      decimals: 18,
      name: 'Renzo Restaked ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'ezETH',
    },
    {
      addressOrDenom: '0xCa965b842699e16b367702310f50161e03eb2d27',
      chainName: 'base',
      collateralAddressOrDenom: '0x2416092f143378750bb29b79eD961ab195CcEea5',
      connections: [
        {
          token: 'ethereum|arbitrum|0x7CFc15E7fD3998B962D1FC137b64d10513c18097',
        },
        {
          token: 'ethereum|optimism|0xb794b059bDA36a01C3757693D4136162752e03C6',
        },
        { token: 'ethereum|tangle|0x536889B3c998D36911BA73411F502662B0754684' },
      ],
      decimals: 18,
      name: 'Renzo Restaked ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'ezETH',
    },
    {
      addressOrDenom: '0xb794b059bDA36a01C3757693D4136162752e03C6',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x2416092f143378750bb29b79eD961ab195CcEea5',
      connections: [
        {
          token: 'ethereum|arbitrum|0x7CFc15E7fD3998B962D1FC137b64d10513c18097',
        },
        { token: 'ethereum|base|0xCa965b842699e16b367702310f50161e03eb2d27' },
        { token: 'ethereum|tangle|0x536889B3c998D36911BA73411F502662B0754684' },
      ],
      decimals: 18,
      name: 'Renzo Restaked ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'ezETH',
    },
    {
      addressOrDenom: '0x536889B3c998D36911BA73411F502662B0754684',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x7CFc15E7fD3998B962D1FC137b64d10513c18097',
        },
        { token: 'ethereum|base|0xCa965b842699e16b367702310f50161e03eb2d27' },
        {
          token: 'ethereum|optimism|0xb794b059bDA36a01C3757693D4136162752e03C6',
        },
      ],
      decimals: 18,
      name: 'Renzo Restaked ETH',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'ezETH',
    },
    {
      addressOrDenom: '0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
      chainName: 'base',
      collateralAddressOrDenom: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
      connections: [
        {
          token: 'ethereum|tangle|0xB703e29F2b05c57Fbc2E3492bE5fC6Db62CE3188',
        },
      ],
      decimals: 8,
      name: 'Lombard Staked Bitcoin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LBTC',
    },
    {
      addressOrDenom: '0xB703e29F2b05c57Fbc2E3492bE5fC6Db62CE3188',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|base|0xD297d7F1B1660334F98941Dc7d3BC4A49b7837EC',
        },
      ],
      decimals: 8,
      name: 'Lombard Staked Bitcoin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'LBTC',
    },
    {
      addressOrDenom: '0xd311608Ca8b12d3cce99D9318bc38b4BCcBdE11d',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60',
      connections: [
        {
          token: 'ethereum|optimism|0x87228bCa8bdB5F3c1EafDddCC14a059Bcde2233b',
        },
        {
          token: 'ethereum|polygon|0x99829129a49517FAc964802cA30E75Fd96143dC2',
        },
        { token: 'ethereum|tangle|0x94AB056b6CF81464458d205E632b2757A311E821' },
      ],
      decimals: 18,
      name: 'Lido DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LDO',
    },
    {
      addressOrDenom: '0x87228bCa8bdB5F3c1EafDddCC14a059Bcde2233b',
      chainName: 'optimism',
      collateralAddressOrDenom: '0xFdb794692724153d1488CcdBE0C56c252596735F',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd311608Ca8b12d3cce99D9318bc38b4BCcBdE11d',
        },
        {
          token: 'ethereum|polygon|0x99829129a49517FAc964802cA30E75Fd96143dC2',
        },
        { token: 'ethereum|tangle|0x94AB056b6CF81464458d205E632b2757A311E821' },
      ],
      decimals: 18,
      name: 'Lido DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LDO',
    },
    {
      addressOrDenom: '0x99829129a49517FAc964802cA30E75Fd96143dC2',
      chainName: 'polygon',
      collateralAddressOrDenom: '0xC3C7d422809852031b44ab29EEC9F1EfF2A58756',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd311608Ca8b12d3cce99D9318bc38b4BCcBdE11d',
        },
        {
          token: 'ethereum|optimism|0x87228bCa8bdB5F3c1EafDddCC14a059Bcde2233b',
        },
        { token: 'ethereum|tangle|0x94AB056b6CF81464458d205E632b2757A311E821' },
      ],
      decimals: 18,
      name: 'Lido DAO Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LDO',
    },
    {
      addressOrDenom: '0x94AB056b6CF81464458d205E632b2757A311E821',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd311608Ca8b12d3cce99D9318bc38b4BCcBdE11d',
        },
        {
          token: 'ethereum|optimism|0x87228bCa8bdB5F3c1EafDddCC14a059Bcde2233b',
        },
        {
          token: 'ethereum|polygon|0x99829129a49517FAc964802cA30E75Fd96143dC2',
        },
      ],
      decimals: 18,
      name: 'Lido DAO Token',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'LDO',
    },
    {
      addressOrDenom: '0x488A2E673B0bA9876788A7497c331EfaA14d5F81',
      chainName: 'holesky',
      collateralAddressOrDenom: '0x44df1a79760f09153cf31e7bd7f42be432e30f9c',
      connections: [
        {
          token:
            'ethereum|tangletestnet|0x122c216D5379376413Fc7B547598AcD5268A57B4',
        },
      ],
      decimals: 18,
      name: 'LimeDrop',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LDT',
    },
    {
      addressOrDenom: '0x122c216D5379376413Fc7B547598AcD5268A57B4',
      chainName: 'tangletestnet',
      connections: [
        {
          token: 'ethereum|holesky|0x488A2E673B0bA9876788A7497c331EfaA14d5F81',
        },
      ],
      decimals: 18,
      name: 'LimeDrop',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'LDT',
    },
    {
      addressOrDenom: '0x0251Bdc4cd9226B369859fd75D5be133EF48e7D9',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      connections: [
        {
          token: 'ethereum|optimism|0x7a6BB435590eab856cA0b19EF5bFC227346f0f96',
        },
        {
          token: 'ethereum|polygon|0xfeE0B3295D2f7e209217F33FDb46e79D6b3C15C7',
        },
        {
          token: 'ethereum|tangle|0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
        },
        {
          token: 'ethereum|base|0xB922779bB836765598709032736C86c67E5A514e',
        },
      ],
      decimals: 18,
      name: 'ChainLink Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LINK',
    },
    {
      addressOrDenom: '0x7a6BB435590eab856cA0b19EF5bFC227346f0f96',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
      connections: [
        {
          token: 'ethereum|arbitrum|0x0251Bdc4cd9226B369859fd75D5be133EF48e7D9',
        },
        {
          token: 'ethereum|polygon|0xfeE0B3295D2f7e209217F33FDb46e79D6b3C15C7',
        },
        {
          token: 'ethereum|tangle|0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
        },
        {
          token: 'ethereum|base|0xB922779bB836765598709032736C86c67E5A514e',
        },
      ],
      decimals: 18,
      name: 'ChainLink Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LINK',
    },
    {
      addressOrDenom: '0xfeE0B3295D2f7e209217F33FDb46e79D6b3C15C7',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
      connections: [
        {
          token: 'ethereum|arbitrum|0x0251Bdc4cd9226B369859fd75D5be133EF48e7D9',
        },
        {
          token: 'ethereum|optimism|0x7a6BB435590eab856cA0b19EF5bFC227346f0f96',
        },
        {
          token: 'ethereum|tangle|0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
        },
        {
          token: 'ethereum|base|0xB922779bB836765598709032736C86c67E5A514e',
        },
      ],
      decimals: 18,
      name: 'ChainLink Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LINK',
    },
    {
      addressOrDenom: '0xB922779bB836765598709032736C86c67E5A514e',
      chainName: 'base',
      collateralAddressOrDenom: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196',
      connections: [
        {
          token: 'ethereum|arbitrum|0x0251Bdc4cd9226B369859fd75D5be133EF48e7D9',
        },
        {
          token: 'ethereum|optimism|0x7a6BB435590eab856cA0b19EF5bFC227346f0f96',
        },
        {
          token: 'ethereum|polygon|0xfeE0B3295D2f7e209217F33FDb46e79D6b3C15C7',
        },
        {
          token: 'ethereum|tangle|0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
        },
      ],
      decimals: 18,
      name: 'ChainLink Token',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'LINK',
    },
    {
      addressOrDenom: '0xd27b4c2F12d0E197c5563daa507DB31c5994180D',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x0251Bdc4cd9226B369859fd75D5be133EF48e7D9',
        },
        {
          token: 'ethereum|optimism|0x7a6BB435590eab856cA0b19EF5bFC227346f0f96',
        },
        {
          token: 'ethereum|polygon|0xfeE0B3295D2f7e209217F33FDb46e79D6b3C15C7',
        },
        {
          token: 'ethereum|base|0xB922779bB836765598709032736C86c67E5A514e',
        },
      ],
      decimals: 18,
      name: 'ChainLink Token',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'LINK',
    },
    {
      addressOrDenom: '0x3fD392c4b9c8ceD4bA003115A7803D0Fa0c6718B',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x4200000000000000000000000000000000000042',
      connections: [
        {
          token: 'ethereum|tangle|0x117Ea1d145787472C368aB427ae9A4B0b5B8CEe9',
        },
      ],
      decimals: 18,
      name: 'Optimism',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'OP',
    },
    {
      addressOrDenom: '0x117Ea1d145787472C368aB427ae9A4B0b5B8CEe9',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|optimism|0x3fD392c4b9c8ceD4bA003115A7803D0Fa0c6718B',
        },
      ],
      decimals: 18,
      name: 'Optimism',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'OP',
    },
    {
      addressOrDenom: '0xCdb39557fa155Ff98d11739B6A5F687E7Cb922d8',
      chainName: 'polygon',
      connections: [
        {
          token: 'ethereum|tangle|0x160F5cD345Db235C92B671782d27F5aA6F2f31EB',
        },
      ],
      decimals: 18,
      name: 'Polygon Ecosystem Token',
      standard: TokenStandard.EvmHypNative,
      symbol: 'POL',
    },
    {
      addressOrDenom: '0x160F5cD345Db235C92B671782d27F5aA6F2f31EB',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|polygon|0xCdb39557fa155Ff98d11739B6A5F687E7Cb922d8',
        },
      ],
      decimals: 18,
      name: 'Polygon Ecosystem Token',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'POL',
    },
    {
      addressOrDenom: '0xB6e1965e8c13657e25450F0161eebAD8F2b2FC0E',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
      connections: [
        {
          token: 'ethereum|base|0xb2434BA552d88e026c1D339CFE8c827d98A626b9',
        },
        {
          token: 'ethereum|optimism|0xEF783f54b69554f0A3c7263DF508A395febb407b',
        },
        {
          token: 'ethereum|polygon|0x158C33834acf0B3d061DdFA1C7784cA595AC1c25',
        },
        {
          token: 'ethereum|tangle|0xbD33235a960874027ad0C7393BE8583572EE2f5b',
        },
      ],
      decimals: 18,
      name: 'Rocket Pool ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'rETH',
    },
    {
      addressOrDenom: '0xb2434BA552d88e026c1D339CFE8c827d98A626b9',
      chainName: 'base',
      collateralAddressOrDenom: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c',
      connections: [
        {
          token: 'ethereum|arbitrum|0xB6e1965e8c13657e25450F0161eebAD8F2b2FC0E',
        },
        {
          token: 'ethereum|optimism|0xEF783f54b69554f0A3c7263DF508A395febb407b',
        },
        {
          token: 'ethereum|polygon|0x158C33834acf0B3d061DdFA1C7784cA595AC1c25',
        },
        {
          token: 'ethereum|tangle|0xbD33235a960874027ad0C7393BE8583572EE2f5b',
        },
      ],
      decimals: 18,
      name: 'Rocket Pool ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'rETH',
    },
    {
      addressOrDenom: '0xEF783f54b69554f0A3c7263DF508A395febb407b',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D',
      connections: [
        {
          token: 'ethereum|arbitrum|0xB6e1965e8c13657e25450F0161eebAD8F2b2FC0E',
        },
        {
          token: 'ethereum|base|0xb2434BA552d88e026c1D339CFE8c827d98A626b9',
        },
        {
          token: 'ethereum|polygon|0x158C33834acf0B3d061DdFA1C7784cA595AC1c25',
        },
        {
          token: 'ethereum|tangle|0xbD33235a960874027ad0C7393BE8583572EE2f5b',
        },
      ],
      decimals: 18,
      name: 'Rocket Pool ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'rETH',
    },
    {
      addressOrDenom: '0x158C33834acf0B3d061DdFA1C7784cA595AC1c25',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x0266F4F08D82372CF0FcbCCc0Ff74309089c74d1',
      connections: [
        {
          token: 'ethereum|arbitrum|0xB6e1965e8c13657e25450F0161eebAD8F2b2FC0E',
        },
        {
          token: 'ethereum|base|0xb2434BA552d88e026c1D339CFE8c827d98A626b9',
        },
        {
          token: 'ethereum|optimism|0xEF783f54b69554f0A3c7263DF508A395febb407b',
        },
        {
          token: 'ethereum|tangle|0xbD33235a960874027ad0C7393BE8583572EE2f5b',
        },
      ],
      decimals: 18,
      name: 'Rocket Pool ETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'rETH',
    },
    {
      addressOrDenom: '0xbD33235a960874027ad0C7393BE8583572EE2f5b',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xB6e1965e8c13657e25450F0161eebAD8F2b2FC0E',
        },
        {
          token: 'ethereum|base|0xb2434BA552d88e026c1D339CFE8c827d98A626b9',
        },
        {
          token: 'ethereum|optimism|0xEF783f54b69554f0A3c7263DF508A395febb407b',
        },
        {
          token: 'ethereum|polygon|0x158C33834acf0B3d061DdFA1C7784cA595AC1c25',
        },
      ],
      decimals: 18,
      name: 'Rocket Pool ETH',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'rETH',
    },
    {
      addressOrDenom: '0xc80f2Bd6Bc9C74a6674bC0A0966e76a5eAC51Cf7',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x3647c54c4c2C65bC7a2D63c0Da2809B399DBBDC0',
      connections: [
        {
          token: 'ethereum|tangle|0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
        },
      ],
      decimals: 18,
      name: 'Solv BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'SolvBTC',
    },
    {
      addressOrDenom: '0x223E7B1EAd79C6603a891D9e733FD5ADD1044dd1',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xc80f2Bd6Bc9C74a6674bC0A0966e76a5eAC51Cf7',
        },
      ],
      decimals: 18,
      name: 'Solv BTC',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'SolvBTC',
    },
    {
      addressOrDenom: '0x122c216D5379376413Fc7B547598AcD5268A57B4',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x346c574c56e1a4aaa8dc88cda8f7eb12b39947ab',
      connections: [
        {
          token: 'ethereum|tangle|0xF0120960A6D667460F21f88778cb5e44cb90Ac3d',
        },
      ],
      decimals: 18,
      name: 'SolvBTC Babylon',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'SolvBTC.BBN',
    },
    {
      addressOrDenom: '0xF0120960A6D667460F21f88778cb5e44cb90Ac3d',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x122c216D5379376413Fc7B547598AcD5268A57B4',
        },
      ],
      decimals: 18,
      name: 'SolvBTC Babylon',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'SolvBTC.BBN',
    },
    {
      addressOrDenom: '0xcC1579deEE9Fd67B3F73EBA8CF2e113bcb59515C',
      chainName: 'base',
      collateralAddressOrDenom: '0x74cb668d23E6e54524e2E1e4d1c392F5fd611783',
      connections: [
        {
          token: 'ethereum|tangle|0xb0b1cb358f4597838859edA7dac076ada0E8aA34',
        },
      ],
      decimals: 18,
      name: 'Staked Avail (Wormhole)',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'stAVAIL',
    },
    {
      addressOrDenom: '0xb0b1cb358f4597838859edA7dac076ada0E8aA34',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|base|0xcC1579deEE9Fd67B3F73EBA8CF2e113bcb59515C',
        },
      ],
      decimals: 18,
      name: 'Staked Avail (Wormhole)',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'stAVAIL',
    },
    {
      addressOrDenom: '0x15BC1c8861def0e6605685bFEdF3A6456f068dBa',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xbc011A12Da28e8F0f528d9eE5E7039E22F91cf18',
      connections: [
        {
          token: 'ethereum|tangle|0x28ce5Ab9E7b4B04f146E3Ca5E3cb87D7b07d5497',
        },
      ],
      decimals: 18,
      name: 'swETH',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'swETH',
    },
    {
      addressOrDenom: '0x28ce5Ab9E7b4B04f146E3Ca5E3cb87D7b07d5497',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x15BC1c8861def0e6605685bFEdF3A6456f068dBa',
        },
      ],
      decimals: 18,
      name: 'swETH',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'swETH',
    },
    {
      addressOrDenom: '0x1654A5e254277FB66773eb4B0E428efB0bFB3Dca',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
      connections: [
        { token: 'ethereum|base|0x21F0ba9E292e1FE8A1C723C8dc3D0bf782b3d75E' },
        {
          token: 'ethereum|optimism|0x5742195A81349F1306361D71A050C4cDdC5814FE',
        },
        {
          token: 'ethereum|polygon|0xF46496DD3eFdbb6Bf69cdEee56aBd17AAC8A0494',
        },
        { token: 'ethereum|tangle|0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241' },
      ],
      decimals: 18,
      name: 'Arbitrum tBTC v2',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'tBTC',
    },
    {
      addressOrDenom: '0x21F0ba9E292e1FE8A1C723C8dc3D0bf782b3d75E',
      chainName: 'base',
      collateralAddressOrDenom: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b',
      connections: [
        {
          token: 'ethereum|arbitrum|0x1654A5e254277FB66773eb4B0E428efB0bFB3Dca',
        },
        {
          token: 'ethereum|optimism|0x5742195A81349F1306361D71A050C4cDdC5814FE',
        },
        {
          token: 'ethereum|polygon|0xF46496DD3eFdbb6Bf69cdEee56aBd17AAC8A0494',
        },
        { token: 'ethereum|tangle|0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241' },
      ],
      decimals: 18,
      name: 'Arbitrum tBTC v2',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'tBTC',
    },
    {
      addressOrDenom: '0x5742195A81349F1306361D71A050C4cDdC5814FE',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
      connections: [
        {
          token: 'ethereum|arbitrum|0x1654A5e254277FB66773eb4B0E428efB0bFB3Dca',
        },
        { token: 'ethereum|base|0x21F0ba9E292e1FE8A1C723C8dc3D0bf782b3d75E' },
        {
          token: 'ethereum|polygon|0xF46496DD3eFdbb6Bf69cdEee56aBd17AAC8A0494',
        },
        { token: 'ethereum|tangle|0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241' },
      ],
      decimals: 18,
      name: 'Arbitrum tBTC v2',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'tBTC',
    },
    {
      addressOrDenom: '0xF46496DD3eFdbb6Bf69cdEee56aBd17AAC8A0494',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b',
      connections: [
        {
          token: 'ethereum|arbitrum|0x1654A5e254277FB66773eb4B0E428efB0bFB3Dca',
        },
        { token: 'ethereum|base|0x21F0ba9E292e1FE8A1C723C8dc3D0bf782b3d75E' },
        {
          token: 'ethereum|optimism|0x5742195A81349F1306361D71A050C4cDdC5814FE',
        },
        { token: 'ethereum|tangle|0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241' },
      ],
      decimals: 18,
      name: 'Arbitrum tBTC v2',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'tBTC',
    },
    {
      addressOrDenom: '0x9330D5e38d714e1E71fd2dBeA7EbD98f13E4E241',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x1654A5e254277FB66773eb4B0E428efB0bFB3Dca',
        },
        { token: 'ethereum|base|0x21F0ba9E292e1FE8A1C723C8dc3D0bf782b3d75E' },
        {
          token: 'ethereum|optimism|0x5742195A81349F1306361D71A050C4cDdC5814FE',
        },
        {
          token: 'ethereum|polygon|0xF46496DD3eFdbb6Bf69cdEee56aBd17AAC8A0494',
        },
      ],
      decimals: 18,
      name: 'Arbitrum tBTC v2',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'tBTC',
    },
    {
      addressOrDenom: '0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
      connections: [
        {
          token: 'ethereum|optimism|0x25Eb364cb96485c22eE70a6cfc60717F0C0b3380',
        },
        {
          token: 'ethereum|polygon|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
        { token: 'ethereum|tangle|0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82' },
      ],
      decimals: 18,
      name: 'Uniswap',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'UNI',
    },
    {
      addressOrDenom: '0x25Eb364cb96485c22eE70a6cfc60717F0C0b3380',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x6fd9d7AD17242c41f7131d257212c54A0e816691',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
        },
        {
          token: 'ethereum|polygon|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
        { token: 'ethereum|tangle|0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82' },
      ],
      decimals: 18,
      name: 'Uniswap',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'UNI',
    },
    {
      addressOrDenom: '0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
      chainName: 'polygon',
      collateralAddressOrDenom: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
        },
        {
          token: 'ethereum|optimism|0x25Eb364cb96485c22eE70a6cfc60717F0C0b3380',
        },
        { token: 'ethereum|tangle|0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82' },
      ],
      decimals: 18,
      name: 'Uniswap',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'UNI',
    },
    {
      addressOrDenom: '0xC2450aa58A3ec477B04F2122c8101eE6bdcC3A82',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
        },
        {
          token: 'ethereum|optimism|0x25Eb364cb96485c22eE70a6cfc60717F0C0b3380',
        },
        {
          token: 'ethereum|polygon|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
      ],
      decimals: 18,
      name: 'Uniswap',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'UNI',
    },
    {
      addressOrDenom: '0xd7405f4396a90cD6B1f11f172F08034dBd9265D8',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      connections: [
        { token: 'ethereum|base|0xf041B44EE24B5358D0999076933675fF5baCa437' },
        {
          token: 'ethereum|optimism|0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
        },
        {
          token: 'ethereum|polygon|0xf041B44EE24B5358D0999076933675fF5baCa437',
        },
        { token: 'ethereum|tangle|0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa' },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0xf041B44EE24B5358D0999076933675fF5baCa437',
      chainName: 'base',
      collateralAddressOrDenom: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd7405f4396a90cD6B1f11f172F08034dBd9265D8',
        },
        {
          token: 'ethereum|optimism|0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
        },
        {
          token: 'ethereum|polygon|0xf041B44EE24B5358D0999076933675fF5baCa437',
        },
        { token: 'ethereum|tangle|0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa' },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd7405f4396a90cD6B1f11f172F08034dBd9265D8',
        },
        { token: 'ethereum|base|0xf041B44EE24B5358D0999076933675fF5baCa437' },
        {
          token: 'ethereum|polygon|0xf041B44EE24B5358D0999076933675fF5baCa437',
        },
        { token: 'ethereum|tangle|0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa' },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0xf041B44EE24B5358D0999076933675fF5baCa437',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd7405f4396a90cD6B1f11f172F08034dBd9265D8',
        },
        { token: 'ethereum|base|0xf041B44EE24B5358D0999076933675fF5baCa437' },
        {
          token: 'ethereum|optimism|0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
        },
        { token: 'ethereum|tangle|0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa' },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x524322C9bF30137E12f86EFE74D1Cba05f4126Fa',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xd7405f4396a90cD6B1f11f172F08034dBd9265D8',
        },
        { token: 'ethereum|base|0xf041B44EE24B5358D0999076933675fF5baCa437' },
        {
          token: 'ethereum|optimism|0x7A153C00352DCb87E11684ce504bfE4dC170acCb',
        },
        {
          token: 'ethereum|polygon|0xf041B44EE24B5358D0999076933675fF5baCa437',
        },
      ],
      decimals: 6,
      name: 'USD Coin',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDC',
    },
    {
      addressOrDenom: '0x5b6C0685Fc934C53b4523Bf8df5277dC4f3914FA',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      connections: [
        { token: 'ethereum|base|0x72141B45a23333011AaAb07D6fDEBbE97049091e' },
        {
          token: 'ethereum|optimism|0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
        },
        {
          token: 'ethereum|polygon|0x72141B45a23333011AaAb07D6fDEBbE97049091e',
        },
        { token: 'ethereum|tangle|0xa06898e779998eC3a749368DF924d5b94C2465b4' },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x72141B45a23333011AaAb07D6fDEBbE97049091e',
      chainName: 'base',
      collateralAddressOrDenom: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      connections: [
        {
          token: 'ethereum|arbitrum|0x5b6C0685Fc934C53b4523Bf8df5277dC4f3914FA',
        },
        {
          token: 'ethereum|optimism|0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
        },
        {
          token: 'ethereum|polygon|0x72141B45a23333011AaAb07D6fDEBbE97049091e',
        },
        { token: 'ethereum|tangle|0xa06898e779998eC3a749368DF924d5b94C2465b4' },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      connections: [
        {
          token: 'ethereum|arbitrum|0x5b6C0685Fc934C53b4523Bf8df5277dC4f3914FA',
        },
        { token: 'ethereum|base|0x72141B45a23333011AaAb07D6fDEBbE97049091e' },
        {
          token: 'ethereum|polygon|0x72141B45a23333011AaAb07D6fDEBbE97049091e',
        },
        { token: 'ethereum|tangle|0xa06898e779998eC3a749368DF924d5b94C2465b4' },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x72141B45a23333011AaAb07D6fDEBbE97049091e',
      chainName: 'polygon',
      collateralAddressOrDenom: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      connections: [
        {
          token: 'ethereum|arbitrum|0x5b6C0685Fc934C53b4523Bf8df5277dC4f3914FA',
        },
        { token: 'ethereum|base|0x72141B45a23333011AaAb07D6fDEBbE97049091e' },
        {
          token: 'ethereum|optimism|0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
        },
        { token: 'ethereum|tangle|0xa06898e779998eC3a749368DF924d5b94C2465b4' },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0xa06898e779998eC3a749368DF924d5b94C2465b4',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x5b6C0685Fc934C53b4523Bf8df5277dC4f3914FA',
        },
        { token: 'ethereum|base|0x72141B45a23333011AaAb07D6fDEBbE97049091e' },
        {
          token: 'ethereum|optimism|0x108F919b5A76B64e80dBf74130Ff6441A62F6405',
        },
        {
          token: 'ethereum|polygon|0x72141B45a23333011AaAb07D6fDEBbE97049091e',
        },
      ],
      decimals: 6,
      name: 'Tether USD',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDT',
    },
    {
      addressOrDenom: '0x4139b8F1474FFd04EE15F86103EF53f8Fdb3d8D0',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef',
      connections: [
        {
          token: 'ethereum|tangle|0x04667a82F593d55aa34CE38B204Ec0Fdc54cDe0C',
        },
      ],
      decimals: 18,
      name: 'USDX',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'USDX',
    },
    {
      addressOrDenom: '0x04667a82F593d55aa34CE38B204Ec0Fdc54cDe0C',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x4139b8F1474FFd04EE15F86103EF53f8Fdb3d8D0',
        },
      ],
      decimals: 18,
      name: 'USDX',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'USDX',
    },
    {
      addressOrDenom: '0x44626462ed716DF3569a55c3584CEe2027d061bf',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      connections: [
        { token: 'ethereum|base|0x989Ecb4dB2543b694b7496f5823DA6fDd26cb5C5' },
        {
          token: 'ethereum|optimism|0xDCb6a0a3bC5e034400e845483f21da67866691Bb',
        },
        {
          token: 'ethereum|polygon|0x0E7f434f502200ec7BEb04Ed6B38DFaf0aD88617',
        },
        { token: 'ethereum|tangle|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7' },
      ],
      decimals: 8,
      name: 'Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WBTC',
    },
    {
      addressOrDenom: '0x989Ecb4dB2543b694b7496f5823DA6fDd26cb5C5',
      chainName: 'base',
      collateralAddressOrDenom: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
      connections: [
        {
          token: 'ethereum|arbitrum|0x44626462ed716DF3569a55c3584CEe2027d061bf',
        },
        {
          token: 'ethereum|optimism|0xDCb6a0a3bC5e034400e845483f21da67866691Bb',
        },
        {
          token: 'ethereum|polygon|0x0E7f434f502200ec7BEb04Ed6B38DFaf0aD88617',
        },
        { token: 'ethereum|tangle|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7' },
      ],
      decimals: 8,
      name: 'Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WBTC',
    },
    {
      addressOrDenom: '0xDCb6a0a3bC5e034400e845483f21da67866691Bb',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      connections: [
        {
          token: 'ethereum|arbitrum|0x44626462ed716DF3569a55c3584CEe2027d061bf',
        },
        { token: 'ethereum|base|0x989Ecb4dB2543b694b7496f5823DA6fDd26cb5C5' },
        {
          token: 'ethereum|polygon|0x0E7f434f502200ec7BEb04Ed6B38DFaf0aD88617',
        },
        { token: 'ethereum|tangle|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7' },
      ],
      decimals: 8,
      name: 'Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WBTC',
    },
    {
      addressOrDenom: '0x0E7f434f502200ec7BEb04Ed6B38DFaf0aD88617',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      connections: [
        {
          token: 'ethereum|arbitrum|0x44626462ed716DF3569a55c3584CEe2027d061bf',
        },
        { token: 'ethereum|base|0x989Ecb4dB2543b694b7496f5823DA6fDd26cb5C5' },
        {
          token: 'ethereum|optimism|0xDCb6a0a3bC5e034400e845483f21da67866691Bb',
        },
        { token: 'ethereum|tangle|0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7' },
      ],
      decimals: 8,
      name: 'Wrapped BTC',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WBTC',
    },
    {
      addressOrDenom: '0xd5c9FCfF2f362E89538E92e8B6e677571E11C1e7',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x44626462ed716DF3569a55c3584CEe2027d061bf',
        },
        { token: 'ethereum|base|0x989Ecb4dB2543b694b7496f5823DA6fDd26cb5C5' },
        {
          token: 'ethereum|optimism|0xDCb6a0a3bC5e034400e845483f21da67866691Bb',
        },
        {
          token: 'ethereum|polygon|0x0E7f434f502200ec7BEb04Ed6B38DFaf0aD88617',
        },
      ],
      decimals: 8,
      name: 'Wrapped BTC',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'WBTC',
    },
    {
      addressOrDenom: '0x02644D01979CDe915eD7D7C3a997072F5716D137',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      connections: [
        { token: 'ethereum|base|0xAa14351a1FdD71f5Fdf3653AF0130f79fC005F6f' },
        {
          token: 'ethereum|optimism|0x677952E2ff8c5Fb2F2455a84AC70208f4c3d7810',
        },
        {
          token: 'ethereum|polygon|0x0fB3F8e01fAEf0eBC1E56F34E58BA3edCe75B116',
        },
        { token: 'ethereum|tangle|0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52' },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0xAa14351a1FdD71f5Fdf3653AF0130f79fC005F6f',
      chainName: 'base',
      collateralAddressOrDenom: '0x4200000000000000000000000000000000000006',
      connections: [
        {
          token: 'ethereum|arbitrum|0x02644D01979CDe915eD7D7C3a997072F5716D137',
        },
        {
          token: 'ethereum|optimism|0x677952E2ff8c5Fb2F2455a84AC70208f4c3d7810',
        },
        {
          token: 'ethereum|polygon|0x0fB3F8e01fAEf0eBC1E56F34E58BA3edCe75B116',
        },
        { token: 'ethereum|tangle|0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52' },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0x677952E2ff8c5Fb2F2455a84AC70208f4c3d7810',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x4200000000000000000000000000000000000006',
      connections: [
        {
          token: 'ethereum|arbitrum|0x02644D01979CDe915eD7D7C3a997072F5716D137',
        },
        { token: 'ethereum|base|0xAa14351a1FdD71f5Fdf3653AF0130f79fC005F6f' },
        {
          token: 'ethereum|polygon|0x0fB3F8e01fAEf0eBC1E56F34E58BA3edCe75B116',
        },
        { token: 'ethereum|tangle|0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52' },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0x0fB3F8e01fAEf0eBC1E56F34E58BA3edCe75B116',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x11CD37bb86F65419713f30673A480EA33c826872',
      connections: [
        {
          token: 'ethereum|arbitrum|0x02644D01979CDe915eD7D7C3a997072F5716D137',
        },
        { token: 'ethereum|base|0xAa14351a1FdD71f5Fdf3653AF0130f79fC005F6f' },
        {
          token: 'ethereum|optimism|0x677952E2ff8c5Fb2F2455a84AC70208f4c3d7810',
        },
        { token: 'ethereum|tangle|0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52' },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0xf1025024e86Ffbb639A00EE7918B0411eE4B7e52',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0x02644D01979CDe915eD7D7C3a997072F5716D137',
        },
        { token: 'ethereum|base|0xAa14351a1FdD71f5Fdf3653AF0130f79fC005F6f' },
        {
          token: 'ethereum|optimism|0x677952E2ff8c5Fb2F2455a84AC70208f4c3d7810',
        },
        {
          token: 'ethereum|polygon|0x0fB3F8e01fAEf0eBC1E56F34E58BA3edCe75B116',
        },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
      chainName: 'arbitrum',
      collateralAddressOrDenom: '0x5979D7b546E38E414F7E9822514be443A4800529',
      connections: [
        { token: 'ethereum|base|0x451c6284eEA043Fa3969bA65530E96421C89bF9b' },
        {
          token: 'ethereum|optimism|0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
        },
        {
          token: 'ethereum|polygon|0x5180c082e7E438c80cF4235C098C8CB0a7c3E3FD',
        },
        { token: 'ethereum|tangle|0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48' },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x451c6284eEA043Fa3969bA65530E96421C89bF9b',
      chainName: 'base',
      collateralAddressOrDenom: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
      connections: [
        {
          token: 'ethereum|arbitrum|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
        {
          token: 'ethereum|optimism|0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
        },
        {
          token: 'ethereum|polygon|0x5180c082e7E438c80cF4235C098C8CB0a7c3E3FD',
        },
        { token: 'ethereum|tangle|0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48' },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
      chainName: 'optimism',
      collateralAddressOrDenom: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      connections: [
        {
          token: 'ethereum|arbitrum|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
        { token: 'ethereum|base|0x451c6284eEA043Fa3969bA65530E96421C89bF9b' },
        {
          token: 'ethereum|polygon|0x5180c082e7E438c80cF4235C098C8CB0a7c3E3FD',
        },
        { token: 'ethereum|tangle|0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48' },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0x5180c082e7E438c80cF4235C098C8CB0a7c3E3FD',
      chainName: 'polygon',
      collateralAddressOrDenom: '0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD',
      connections: [
        {
          token: 'ethereum|arbitrum|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
        { token: 'ethereum|base|0x451c6284eEA043Fa3969bA65530E96421C89bF9b' },
        {
          token: 'ethereum|optimism|0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
        },
        { token: 'ethereum|tangle|0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48' },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0xC0fD9c0ee70d7d9Eede7f5918077dC506aF95E48',
      chainName: 'tangle',
      connections: [
        {
          token: 'ethereum|arbitrum|0xa3E0920CAf0e2eDDDe54D49fFC1d82e1a23c9693',
        },
        { token: 'ethereum|base|0x451c6284eEA043Fa3969bA65530E96421C89bF9b' },
        {
          token: 'ethereum|optimism|0x99Ce18058C6fE35216D8626C3D183526240CcCbb',
        },
        {
          token: 'ethereum|polygon|0x5180c082e7E438c80cF4235C098C8CB0a7c3E3FD',
        },
      ],
      decimals: 18,
      name: 'Wrapped liquid staked Ether 2.0',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'wstETH',
    },
    {
      addressOrDenom: '0xc0CB548E329A9Fb2431E651E8e0B3269aD6F1D22',
      chainName: 'holesky',
      collateralAddressOrDenom: '0x4cea2c2c70ca761cb072e8763d65085b3b5f002a',
      connections: [
        {
          token:
            'ethereum|tangletestnet|0xbd6651dd0DAe09818baA8950430D139BD0D899ff',
        },
      ],
      decimals: 18,
      name: 'MangoMint',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'MMT',
    },
    {
      addressOrDenom: '0xbd6651dd0DAe09818baA8950430D139BD0D899ff',
      chainName: 'tangletestnet',
      connections: [
        {
          token: 'ethereum|holesky|0xc0CB548E329A9Fb2431E651E8e0B3269aD6F1D22',
        },
      ],
      decimals: 18,
      name: 'MangoMint',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'MMT',
    },
    {
      addressOrDenom: '0x75F277a14bBe7020aaBd62c482c38391FB09E0ba',
      chainName: 'holesky',
      collateralAddressOrDenom: '0x9afaaf4f870eb87ada3ba033a635c5c861ac83b0',
      connections: [
        {
          token:
            'ethereum|tangletestnet|0xc0CB548E329A9Fb2431E651E8e0B3269aD6F1D22',
        },
      ],
      decimals: 18,
      name: 'CryptoPeach',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'CPT',
    },
    {
      addressOrDenom: '0xc0CB548E329A9Fb2431E651E8e0B3269aD6F1D22',
      chainName: 'tangletestnet',
      connections: [
        {
          token: 'ethereum|holesky|0x75F277a14bBe7020aaBd62c482c38391FB09E0ba',
        },
      ],
      decimals: 18,
      name: 'CryptoPeach',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'CPT',
    },
    {
      addressOrDenom: '0x777053A78AaB486A57A4e09d8FF48Fbb989564dE',
      chainName: 'holesky',
      collateralAddressOrDenom: '0x94373a4919B3240D86eA41593D5eBa789FEF3848',
      connections: [
        {
          token:
            'ethereum|tangletestnet|0x75F277a14bBe7020aaBd62c482c38391FB09E0ba',
        },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypCollateral,
      symbol: 'WETH',
    },
    {
      addressOrDenom: '0x75F277a14bBe7020aaBd62c482c38391FB09E0ba',
      chainName: 'tangletestnet',
      connections: [
        {
          token: 'ethereum|holesky|0x777053A78AaB486A57A4e09d8FF48Fbb989564dE',
        },
      ],
      decimals: 18,
      name: 'Wrapped Ether',
      standard: TokenStandard.EvmHypSynthetic,
      symbol: 'WETH',
    },
  ],
};

export const HYPERLANE_WARP_ROUTE_WHITELIST: Array<string> | null = [
  'ARB/arbitrum-tangle',
  'AVAIL/base-tangle',
  'BNB/bsc-tangle',
  'cbBTC/arbitrum-tangle',
  'cbBTC/base-tangle',
  'cbETH/arbitrum-tangle',
  'cbETH/base-tangle',
  'cbETH/optimism-tangle',
  'CRV/arbitrum-tangle',
  'CRV/base-tangle',
  'CRV/optimism-tangle',
  'CRV/polygon-tangle',
  'DAI/arbitrum-tangle',
  'DAI/base-tangle',
  'DAI/optimism-tangle',
  'DAI/polygon-tangle',
  'ETH/arbitrum-tangle',
  'ETH/base-tangle',
  'ETH/optimism-tangle',
  'ezETH/arbitrum-tangle',
  'ezETH/base-tangle',
  'ezETH/optimism-tangle',
  'LBTC/base-tangle',
  'LDO/arbitrum-tangle',
  'LDO/optimism-tangle',
  'LDO/polygon-tangle',
  'LDT/holesky-tangle',
  'LINK/arbitrum-tangle',
  'LINK/base-tangle',
  'LINK/optimism-tangle',
  'LINK/polygon-tangle',
  'OP/optimism-tangle',
  'POL/polygon-tangle',
  'rETH/arbitrum-tangle',
  'rETH/base-tangle',
  'rETH/optimism-tangle',
  'rETH/polygon-tangle',
  'SolvBTC/arbitrum-tangle',
  'SolvBTC.BBN/arbitrum-tangle',
  'stAVAIL/base-tangle',
  'swETH/arbitrum-tangle',
  'tBTC/arbitrum-tangle',
  'tBTC/base-tangle',
  'tBTC/optimism-tangle',
  'tBTC/polygon-tangle',
  'UNI/arbitrum-tangle',
  'UNI/optimism-tangle',
  'UNI/polygon-tangle',
  'USDC/arbitrum-tangle',
  'USDC/base-tangle',
  'USDC/optimism-tangle',
  'USDC/polygon-tangle',
  'USDT/arbitrum-tangle',
  'USDT/base-tangle',
  'USDT/optimism-tangle',
  'USDT/polygon-tangle',
  'USDX/arbitrum-tangle',
  'WBTC/arbitrum-tangle',
  'WBTC/base-tangle',
  'WBTC/optimism-tangle',
  'WBTC/polygon-tangle',
  'WETH/arbitrum-tangle',
  'WETH/base-tangle',
  'WETH/optimism-tangle',
  'WETH/polygon-tangle',
  'wstETH/arbitrum-tangle',
  'wstETH/base-tangle',
  'wstETH/optimism-tangle',
  'wstETH/polygon-tangle',
  'MMT/holesky-tangle',
  'CPT/holesky-tangle',
  'WETH/holesky-tangle',
];

export const mailboxAddress = {
  [PresetTypedChainId.Arbitrum]: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
  [PresetTypedChainId.Base]: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  [PresetTypedChainId.BSC]: '0x2971b9Aec44bE4eb673DF1B88cDB57b96eefe8a4',
  [PresetTypedChainId.Linea]: '0x02d16BC51af6BfD153d67CA61754cF912E82C4d9',
  [PresetTypedChainId.Holesky]: '0xAA40AD8f072b8bbbE26637678fE0E74A47eFbe31',
  [PresetTypedChainId.Optimism]: '0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D',
  [PresetTypedChainId.Polygon]: '0x5d934f4e2f797775e53561bB72aca21ba36B96BB',
  [PresetTypedChainId.TangleMainnetEVM]:
    '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  [PresetTypedChainId.TangleTestnetEVM]:
    '0x47818e35750e70CC2245B00a17118F8268Ff6Bfd',
};
