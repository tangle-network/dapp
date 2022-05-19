import { AppConfig, InternalChainId, WebbCurrencyId } from '@webb-tools/api-providers';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [WebbCurrencyId.webbWETH]: [
    {
      amount: '0.01',
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.Ropsten]: '0x228ac202fb6ad3d3a39f59e4a578a0eafd3286cd',
        [InternalChainId.Rinkeby]: '0xa238c5987142af720b9232d9d72a12a3868396e0',
        [InternalChainId.Goerli]: '0x03b88ed9ff9be84e4bad3f55d67ae5aba610523c',
        [InternalChainId.PolygonTestnet]: '0xa8665042ea4767fa09143bd790059ce53bdf2a8f',
        [InternalChainId.OptimismTestnet]: '0x09d2d6520be3922549c81885477258f41c96c43f',
        [InternalChainId.ArbitrumTestnet]: '0x2d21bc3f8cb399d3b7091309afe1986cdb9f2e39',
      },
    },
  ],
  [WebbCurrencyId.WEBB]: [
    {
      amount: '10',
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '3',
      },
      anchorAddresses: {},
    },
    {
      amount: '100',
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '4',
      },
      anchorAddresses: {},
    },
    {
      amount: '1000',
      anchorTreeIds: {
        [InternalChainId.ProtocolSubstrateStandalone]: '5',
      },
      anchorAddresses: {},
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
    },
    {
      amount: '0.01',
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.HermesLocalnet]: '0xaC361518Bb9535D0E3172DC45a4e56d71a7FDFc4',
        [InternalChainId.AthenaLocalnet]: '0x3d3955aAe5Bdf9E6547A140Baad4BC57Fa4EBA17',
        [InternalChainId.DemeterLocalnet]: '0x91eB86019FD8D7c5a9E31143D422850A13F670A3',
      },
    },
  ],
};
