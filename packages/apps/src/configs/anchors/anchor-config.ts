import { AppConfig, InternalChainId, WebbCurrencyId } from '@webb-dapp/api-providers';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [WebbCurrencyId.webbWETH]: [
    {
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.Ropsten]: '0x53590FF8d6FddC12e9651017F5399d06Dc925C71',
        [InternalChainId.Rinkeby]: '0x5CaedaFEf2Fd8B4DF34B2d16134204dFC6b3F6b3',
        [InternalChainId.Goerli]: '0xE24A63Ebb690d0d6C241FDd4aA8ad90421f91D8a',
        [InternalChainId.Kovan]: '0x1066C35e76c565cbd65FB3a6CB4C6B3161C302B4',
        [InternalChainId.PolygonTestnet]: '0xe76187266aDFcEcd7CACa83B8F76d7333a592E81',
        [InternalChainId.OptimismTestnet]: '0xB6836ace175ca5144b966F0633fCf0057E47595B',
        [InternalChainId.ArbitrumTestnet]: '0x5353cede4b8fea148fb1f66f45d3ec27bff2224d',
        [InternalChainId.MoonbaseAlpha]: '0x0D8D947EB29284a8f7c28E8bAA978E913bf6F5AF',
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
        [InternalChainId.HermesLocalnet]: '0x4e3df2073bf4b43b9944b8e5a463b1e185d6448c',
        [InternalChainId.AthenaLocalnet]: '0x4e3df2073bf4b43b9944b8e5a463b1e185d6448c',
        [InternalChainId.DemeterLocalnet]: '0x4e3df2073bf4b43b9944b8e5a463b1e185d6448c',
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
