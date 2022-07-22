import { AppConfig, CurrencyId, PresetTypedChainId } from '@webb-dapp/api-providers';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [CurrencyId.webbETH]: [
    {
      anchorTreeIds: {},
      anchorAddresses: {
        [PresetTypedChainId.Ropsten]: '0x66e04f6ae26c310e39f5bf24d873909e6d3b64c7',
        [PresetTypedChainId.Rinkeby]: '0x91127f21d63029eb5b2de05b4b1e9fd3497ee95b',
        [PresetTypedChainId.Goerli]: '0x682faa319bf7bae7f0cb68435e857d22bf976e17',
        [PresetTypedChainId.Kovan]: '0x148e8037ea12834117f3efd9e8990c16c1ff5653',
        [PresetTypedChainId.PolygonTestnet]: '0x1371efed369498718bee3eb5d58e5d3dec86be85',
        [PresetTypedChainId.OptimismTestnet]: '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d',
        [PresetTypedChainId.ArbitrumTestnet]: '0x4953110789d0cb6de126f4ea88890670ccfe6906',
        [PresetTypedChainId.MoonbaseAlpha]: '0x0c5f4951f42eec082bd1356b9b41928b4f0e7542',
      },
      type: 'variable',
    },
  ],
  [CurrencyId.WEBB]: [
    {
      anchorTreeIds: {
        [PresetTypedChainId.ProtocolSubstrateStandalone]: '9',
      },
      anchorAddresses: {},
      type: 'variable',
    },
  ],
  [CurrencyId.webbDEV]: [
    {
      anchorTreeIds: {},
      anchorAddresses: {
        [PresetTypedChainId.HermesLocalnet]: '0x510C6297cC30A058F41eb4AF1BFC9953EaD8b577',
        [PresetTypedChainId.AthenaLocalnet]: '0xcbD945E77ADB65651F503723aC322591f3435cC5',
        [PresetTypedChainId.DemeterLocalnet]: '0x7758F98C1c487E5653795470eEab6C4698bE541b',
      },
      type: 'variable',
    },
  ],
  [CurrencyId.TEST]: [
    {
      anchorTreeIds: {
        [PresetTypedChainId.ProtocolSubstrateStandalone]: '9',
      },
      anchorAddresses: {},
      type: 'variable',
    },
  ],
};
