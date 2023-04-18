import { PresetTypedChainId } from '@webb-tools/dapp-types';

// 0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d - webbAlpha - mocked backend
// 0x6B0B2dFbf3c13ebF92364eAC95dbCA5C9eB8e0f1 - webbtTNT - mocked backend

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
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
    '0x6B0B2dFbf3c13ebF92364eAC95dbCA5C9eB8e0f1': 52,
  },
  [PresetTypedChainId.AthenaOrbit]: {
    '0x6B0B2dFbf3c13ebF92364eAC95dbCA5C9eB8e0f1': 52,
  },
  [PresetTypedChainId.DemeterOrbit]: {
    '0x6B0B2dFbf3c13ebF92364eAC95dbCA5C9eB8e0f1': 52,
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
