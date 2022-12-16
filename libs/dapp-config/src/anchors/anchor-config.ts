import { ApiConfig } from '..';
import {
  CurrencyId,
  EVMChainId,
  PresetTypedChainId,
} from '@webb-tools/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: ApiConfig['anchors'] = {
  [CurrencyId.webbETH]: {
    [PresetTypedChainId.Goerli]: '0x98c1024dfd61a8f7439108acedcb51a27754f2af',
    [PresetTypedChainId.Sepolia]: '0x1f88e3903a36f1c2f997822579a651cb8022c64b',
    [PresetTypedChainId.PolygonTestnet]:
      '0xdb3365f086e9e3536d0f12abb822d048c7a60ebd',
    [PresetTypedChainId.OptimismTestnet]:
      '0xd2fbe0fd50315c13ac9a9331dadb1784c1ef6bb8',
    [PresetTypedChainId.MoonbaseAlpha]:
      '0xdb3365f086e9e3536d0f12abb822d048c7a60ebd',
  },
  [CurrencyId.WEBBSQR]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '6',
    [PresetTypedChainId.LocalTangleStandalone]: '6',
    [PresetTypedChainId.DkgSubstrateStandalone]: '6',
  },
  [CurrencyId.webbDEV]: {
    [PresetTypedChainId.HermesLocalnet]:
      '0x6d5a4D246617d711595a1657c55B17B97e20bdda',
    [PresetTypedChainId.AthenaLocalnet]:
      '0x6595b34ED0a270B10a586FC1EA22030A95386f1e',
    [PresetTypedChainId.DemeterLocalnet]:
      '0xcd75Ad7AC9C9325105f798c476E84176648F391A',
  },
  [CurrencyId.TEST]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '9',
  },
};

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x98c1024dfd61a8f7439108acedcb51a27754f2af': 8134383,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0x1f88e3903a36f1c2f997822579a651cb8022c64b': 2478565,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xdb3365f086e9e3536d0f12abb822d048c7a60ebd': 29689383,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0xd2fbe0fd50315c13ac9a9331dadb1784c1ef6bb8': 3447785,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xdb3365f086e9e3536d0f12abb822d048c7a60ebd': 3355037,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0x6d5a4D246617d711595a1657c55B17B97e20bdda': 95,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x6595b34ED0a270B10a586FC1EA22030A95386f1e': 95,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0xcd75Ad7AC9C9325105f798c476E84176648F391A': 95,
  },
};

export const getAnchorDeploymentBlockNumber = (
  chainIdType: number,
  contractAddress: string
): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};
