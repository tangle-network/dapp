import { EVMChainId } from '@webb-tools/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

// 0xa1a2b7e08793b3033122b83cbee56726678588b5 - webbWETH - mocked backend
// 0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d - webbAlpha - mocked backend
// 0x9678647b9fcb0039652a16dba688bd067d6e5077 - webbStandalone - dkg backend
// 0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4 - webbtTNT-standalone

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8513284,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 13062856,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 14922326,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8508326,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 8703495,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 8648487,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 8768287,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 2920599,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 3146553,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 3082467,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 3220705,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 5611883,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 6646308,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 32139400,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 33462722,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 33068289,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 33927921,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 3771120,
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 3996742,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 3932707,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 4074545,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AvalancheFuji)]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 20151492,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 19810510,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 20573380,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ScrollAlpha)]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 666098,
    '0x9678647b9fcb0039652a16dba688bd067d6e5077': 387417,
    '0xf8c9d24e3bc3e2d3eddde507079b08e82f239fc4': 995373,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xc705034ded85e817b9E56C977E61A2098362898B': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x91eB86019FD8D7c5a9E31143D422850A13F670A3': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0x6595b34ED0a270B10a586FC1EA22030A95386f1e': 0,
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
