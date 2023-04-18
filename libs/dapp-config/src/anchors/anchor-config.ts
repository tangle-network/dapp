import { PresetTypedChainId } from '@webb-tools/dapp-types';

// 0xa1a2b7e08793b3033122b83cbee56726678588b5 - webbWETH - mocked backend
// 0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d - webbAlpha - mocked backend
// 0xaa4cd2df238be5c360d2031bac48dc17e6a187d8 - webbStandAlone - DKG backend
// 0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4 - webbtTNT-standalone

// Substrate chains are only contain treeId

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  // EVMs
  [PresetTypedChainId.ArbitrumTestnet]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8513284,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 13062856,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 14922326,
    '0xaa4cd2df238be5c360d2031bac48dc17e6a187d8': 15309867,
  },
  [PresetTypedChainId.Goerli]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8508326,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 8703495,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 8768287,
    '0xaa4cd2df238be5c360d2031bac48dc17e6a187d8': 8784848,
  },
  [PresetTypedChainId.Sepolia]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 2920599,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 3146553,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 3220705,
    '0xaa4cd2df238be5c360d2031bac48dc17e6a187d8': 3239056,
  },
  [PresetTypedChainId.OptimismTestnet]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 5611883,
  },
  [PresetTypedChainId.PolygonTestnet]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 32139400,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 33462722,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 33927921,
    '0xaa4cd2df238be5c360d2031bac48dc17e6a187d8': 34045996,
  },
  [PresetTypedChainId.MoonbaseAlpha]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 3771120,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 3996742,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 4074545,
    '0xaa4cd2df238be5c360d2031bac48dc17e6a187d8': 4092725,
  },
  [PresetTypedChainId.AvalancheFuji]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 20151492,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 20573380,
  },
  [PresetTypedChainId.ScrollAlpha]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 666098,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 995373,
    '0xaa4cd2df238be5c360d2031bac48dc17e6a187d8': 1079099,
  },
  [PresetTypedChainId.HermesLocalnet]: {
    '0xc705034ded85e817b9E56C977E61A2098362898B': 0,
  },
  [PresetTypedChainId.AthenaLocalnet]: {
    '0x91eB86019FD8D7c5a9E31143D422850A13F670A3': 0,
  },
  [PresetTypedChainId.DemeterLocalnet]: {
    '0x6595b34ED0a270B10a586FC1EA22030A95386f1e': 0,
  },

  // Substrate
  [PresetTypedChainId.ProtocolSubstrateStandalone]: {
    '6': NaN,
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
