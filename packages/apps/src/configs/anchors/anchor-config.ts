import { AppConfig, CurrencyId, PresetTypedChainId } from '@webb-dapp/api-providers';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [CurrencyId.webbETH]: {
    [PresetTypedChainId.Ropsten]: '0x66e04f6ae26c310e39f5bf24d873909e6d3b64c7',
    [PresetTypedChainId.Rinkeby]: '0x91127f21d63029eb5b2de05b4b1e9fd3497ee95b',
    [PresetTypedChainId.Goerli]: '0x682faa319bf7bae7f0cb68435e857d22bf976e17',
    [PresetTypedChainId.Kovan]: '0x148e8037ea12834117f3efd9e8990c16c1ff5653',
    [PresetTypedChainId.PolygonTestnet]: '0x1371efed369498718bee3eb5d58e5d3dec86be85',
    [PresetTypedChainId.OptimismTestnet]: '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d',
    [PresetTypedChainId.ArbitrumTestnet]: '0x4953110789d0cb6de126f4ea88890670ccfe6906',
    [PresetTypedChainId.MoonbaseAlpha]: '0x0c5f4951f42eec082bd1356b9b41928b4f0e7542',
  },
  [CurrencyId.WEBB]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '9',
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
