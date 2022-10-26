import { ApiConfig } from '..';
import { CurrencyId, EVMChainId, PresetTypedChainId } from '@nepoche/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: ApiConfig['anchors'] = {
  [CurrencyId.webbETH]: {
    [PresetTypedChainId.Ropsten]: '0x35295fbb71273b84f66e70b8e341d408150dcaf9',
    [PresetTypedChainId.Rinkeby]: '0x7ae23a95881bf8ab86174e89bd79199f398d19bf',
    [PresetTypedChainId.Goerli]: '0x4e22da303c403daaf4653d3d9d63ef009bae89a6',
    [PresetTypedChainId.PolygonTestnet]: '0xe6b075ecc4ccbc6e66569b1a2984cc47e88ee246',
    [PresetTypedChainId.OptimismTestnet]: '0x12f2c4a1469b035e4459539e38ae68bc4dd5ba07',
    [PresetTypedChainId.ArbitrumTestnet]: '0x91a9a1e76fa609f6ba8fcd718a60b030678765ad',
    [PresetTypedChainId.MoonbaseAlpha]: '0xc6b43568f0c39e3a68b597a3bb54a7b9e4308bf3',
  },
  [CurrencyId.WEBBSQR]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '6',
    [PresetTypedChainId.LocalTangleStandalone]: '6',
    [PresetTypedChainId.DkgSubstrateStandalone]: '6',
  },
  [CurrencyId.webbDEV]: {
    [PresetTypedChainId.HermesLocalnet]: '0xbfce6B877Ebff977bB6e80B24FbBb7bC4eBcA4df',
    [PresetTypedChainId.AthenaLocalnet]: '0xcd75Ad7AC9C9325105f798c476E84176648F391A',
    [PresetTypedChainId.DemeterLocalnet]: '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C',
  },
  [CurrencyId.TEST]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '9',
  },
};

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Ropsten)]: {
    '0x35295fbb71273b84f66e70b8e341d408150dcaf9': 12864534,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Rinkeby)]: {
    '0x7ae23a95881bf8ab86174e89bd79199f398d19bf': 11266630,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x4e22da303c403daaf4653d3d9d63ef009bae89a6': 7471990,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xe6b075ecc4ccbc6e66569b1a2984cc47e88ee246': 27776591,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x12f2c4a1469b035e4459539e38ae68bc4dd5ba07': 640396,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x91a9a1e76fa609f6ba8fcd718a60b030678765ad': 171869,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xc6b43568f0c39e3a68b597a3bb54a7b9e4308bf3': 2723239,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xbfce6b877ebff977bb6e80b24fbbb7bc4ebca4df': 95,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0xcd75Ad7AC9C9325105f798c476E84176648F391A': 95,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C': 95,
  },
};

export const getAnchorDeploymentBlockNumber = (chainIdType: number, contractAddress: string): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};
