import { AppConfig, InternalChainId, WebbCurrencyId } from '@webb-tools/api-providers';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: AppConfig['anchors'] = {
  [WebbCurrencyId.webbWETH]: [
    {
      amount: '0.01',
      anchorTreeIds: {},
      anchorAddresses: {
        [InternalChainId.Ropsten]: '0x09d2D6520BE3922549c81885477258F41c96c43f',
        [InternalChainId.Rinkeby]: '0x95E2eB4c9Fe2FB580E27dCe997e0E3D69FFdDf5a',
        [InternalChainId.Goerli]: '0x6188F18359250f241e2171BAFD57447F8931176e',
        [InternalChainId.PolygonTestnet]: '0x95E2eB4c9Fe2FB580E27dCe997e0E3D69FFdDf5a',
        [InternalChainId.OptimismTestnet]: '0x27a693cdF40acFc18195C2ecc9f0352452624e84',
        [InternalChainId.ArbitrumTestnet]: '0x30aEF9a80BAe60Cd789904C8875fbd6a19b80488',
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
        [InternalChainId.HermesLocalnet]: '0x3Bb7f1A59bDE3B61a0d537723E4e27D022489635',
        [InternalChainId.AthenaLocalnet]: '0x9F4dcd09DE62E1985807C74716dBB6768CE26892',
        [InternalChainId.DemeterLocalnet]: '0x91eB86019FD8D7c5a9E31143D422850A13F670A3',
      },
    },
  ],
};
