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
    [PresetTypedChainId.Goerli]: '0xbd7e08ef54dfb43e9a86eb12a3ecab7564dee931',
    [PresetTypedChainId.Sepolia]: '0x965c94a6e1b713e751164d2ba09aa0306f48ee74',
    [PresetTypedChainId.PolygonTestnet]:
      '0x965c94a6e1b713e751164d2ba09aa0306f48ee74',
    [PresetTypedChainId.OptimismTestnet]:
      '0x26a37ce74e5214dd661070601db14a6a8a2fadd9',
    [PresetTypedChainId.MoonbaseAlpha]:
      '0x75e452a3ce366575f75737438c0fdfe618853946',
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
    '0xbd7e08ef54dfb43e9a86eb12a3ecab7564dee931': 8048194,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0x965c94a6e1b713e751164d2ba09aa0306f48ee74': 2386639,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0x965c94a6e1b713e751164d2ba09aa0306f48ee74': 29416496,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x26a37ce74e5214dd661070601db14a6a8a2fadd9': 3091427,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0x75e452a3ce366575f75737438c0fdfe618853946': 3239271,
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
