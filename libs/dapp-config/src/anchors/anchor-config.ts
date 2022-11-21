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
    [PresetTypedChainId.Goerli]: '0xdc9f140987073619d64898be00143dd312cdc71a',
    [PresetTypedChainId.Sepolia]: '0xa5672fdfe6700452a828c514a9d5b3b4dc5230bf',
    [PresetTypedChainId.PolygonTestnet]:
      '0xcc1f5ebddb858f96051ef315969edaa936ae70e3',
    [PresetTypedChainId.OptimismTestnet]:
      '0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f',
    [PresetTypedChainId.ArbitrumTestnet]:
      '0x12f2c4a1469b035e4459539e38ae68bc4dd5ba07',
    [PresetTypedChainId.MoonbaseAlpha]:
      '0x1349f444a5cd98c5863f786496ca53f3f651f7c7',
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
    '0xdc9f140987073619d64898be00143dd312cdc71a': 7865480,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0xa5672fdfe6700452a828c514a9d5b3b4dc5230bf': 2196862,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xcc1f5ebddb858f96051ef315969edaa936ae70e3': 28905757,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f': 2374192,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x12f2c4a1469b035e4459539e38ae68bc4dd5ba07': 908813,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0x1349f444a5cd98c5863f786496ca53f3f651f7c7': 3097804,
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
