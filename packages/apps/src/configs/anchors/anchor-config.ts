import { AppConfig, InternalChainId, WebbCurrencyId } from '@webb-dapp/api-providers';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [WebbCurrencyId.webbETH]: [
    {
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.Ropsten]: '0x66e04f6ae26c310e39f5bf24d873909e6d3b64c7',
        [InternalChainId.Rinkeby]: '0x91127f21d63029eb5b2de05b4b1e9fd3497ee95b',
        [InternalChainId.Goerli]: '0x682faa319bf7bae7f0cb68435e857d22bf976e17',
        [InternalChainId.Kovan]: '0x148e8037ea12834117f3efd9e8990c16c1ff5653',
        [InternalChainId.PolygonTestnet]: '0x1371efed369498718bee3eb5d58e5d3dec86be85',
        [InternalChainId.OptimismTestnet]: '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d',
        [InternalChainId.ArbitrumTestnet]: '0x4953110789d0cb6de126f4ea88890670ccfe6906',
        [InternalChainId.MoonbaseAlpha]: '0x0c5f4951f42eec082bd1356b9b41928b4f0e7542',
      },
      type: 'variable',
    },
  ],
  [WebbCurrencyId.WEBB]: [
    {
      amount: '10',
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '5',
      },
      anchorAddresses: {},
      type: 'fixed',
    },
    {
      amount: '100',
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '6',
      },
      anchorAddresses: {},
      type: 'fixed',
    },
    {
      amount: '1000',
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '7',
      },
      anchorAddresses: {},
      type: 'fixed',
    },
    {
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '9',
      },
      anchorAddresses: {},
      type: 'variable',
    },
  ],
  [WebbCurrencyId.webbDEV]: [
    {
      amount: '1',
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.HermesLocalnet]: '0xbfce6B877Ebff977bB6e80B24FbBb7bC4eBcA4df',
        [InternalChainId.AthenaLocalnet]: '0xcd75Ad7AC9C9325105f798c476E84176648F391A',
        [InternalChainId.DemeterLocalnet]: '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C',
      },
      type: 'fixed',
    },
    {
      amount: '0.01',
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.HermesLocalnet]: '0xaC361518Bb9535D0E3172DC45a4e56d71a7FDFc4',
        [InternalChainId.AthenaLocalnet]: '0x3d3955aAe5Bdf9E6547A140Baad4BC57Fa4EBA17',
        [InternalChainId.DemeterLocalnet]: '0x91eB86019FD8D7c5a9E31143D422850A13F670A3',
      },
      type: 'fixed',
    },
    {
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.HermesLocalnet]: '0xb824C5F99339C7E486a1b452B635886BE82bc8b7',
        [InternalChainId.AthenaLocalnet]: '0xFEe587E68c470DAE8147B46bB39fF230A29D4769',
        [InternalChainId.DemeterLocalnet]: '0xdB587ef6aaA16b5719CDd3AaB316F0E70473e9Be',
      },
      type: 'variable',
    },
  ],
  [WebbCurrencyId.TEST]: [
    {
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '9',
      },
      anchorAddresses: {},
      type: 'variable',
    },
  ],
};
