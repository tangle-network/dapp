import { PresetTypedChainId } from '@webb-tools/dapp-types';

// 0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d - webbAlpha - mocked backend
// 0x64Ba293E654992a94f304b00e3cEb8FD0f7AA773 - webbtTNT - DKG backend

// Substrate chains are only contain treeId

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  // EVM
  [PresetTypedChainId.ArbitrumTestnet]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 13062856,
  },
  [PresetTypedChainId.Goerli]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 8703495,
  },
  [PresetTypedChainId.Sepolia]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 3146553,
  },
  [PresetTypedChainId.PolygonTestnet]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 33462722,
  },
  [PresetTypedChainId.MoonbaseAlpha]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 3996742,
  },
  [PresetTypedChainId.AvalancheFuji]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 20151492,
  },
  [PresetTypedChainId.ScrollAlpha]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': 666098,
  },
  [PresetTypedChainId.HermesOrbit]: {
    '0x64Ba293E654992a94f304b00e3cEb8FD0f7AA773': 134,
  },
  [PresetTypedChainId.AthenaOrbit]: {
    '0x64Ba293E654992a94f304b00e3cEb8FD0f7AA773': 150,
  },
  [PresetTypedChainId.DemeterOrbit]: {
    '0x64Ba293E654992a94f304b00e3cEb8FD0f7AA773': 131,
  },

  // Substrate
  [PresetTypedChainId.ProtocolSubstrateStandalone]: {
    '6': NaN,
  },
  [PresetTypedChainId.LocalTangleStandalone]: {
    '4': NaN,
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
