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
    [PresetTypedChainId.Goerli]: '0x3a4233bf223622f6571b8543498a62b9e2a3b31f',
    [PresetTypedChainId.Sepolia]: '0xb2d1d8d651c53a00e13ea0a363aab575a6886391',
    [PresetTypedChainId.PolygonTestnet]:
      '0xda27349ee55e7c91e1b521ece4c3dcc390383026',
    [PresetTypedChainId.OptimismTestnet]:
      '0x9d36b94f245857ec7280415140800dde7642addb',
    [PresetTypedChainId.MoonbaseAlpha]:
      '0xda27349ee55e7c91e1b521ece4c3dcc390383026',
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
    '0x3a4233bf223622f6571b8543498a62b9e2a3b31f': 8188267,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0xb2d1d8d651c53a00e13ea0a363aab575a6886391': 2545802,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xda27349ee55e7c91e1b521ece4c3dcc390383026': 30098018,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x9d36b94f245857ec7280415140800dde7642addb': 3706371,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xda27349ee55e7c91e1b521ece4c3dcc390383026': 3418157,
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
