import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { LOCALNET_CHAIN_IDS } from '../chains';

const localAnchorRecord = process.env.BRIDGE_DAPP_LOCAL_ORBIT_ANCHOR_ADDRESS
  ? LOCALNET_CHAIN_IDS.reduce<Record<number, Record<string, number>>>(
      (acc, chainId) => {
        const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
        const anchorAddress: string = process.env
          .BRIDGE_DAPP_LOCAL_ORBIT_ANCHOR_ADDRESS as string;

        acc[typedChainId] = {
          [anchorAddress]: 0,
        };

        return acc;
      },
      {}
    )
  : {};

// 0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d - webbAlpha - mocked backend
// 0x34E2a2686B8a8FD62ee1FB2865be67bAB75b21dD - webbtTNT - DKG backend

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
    '0x765A081120c1760d72D09d7c4e28Aa275D7D3fad': 1,
  },
  [PresetTypedChainId.AthenaOrbit]: {
    '0x765A081120c1760d72D09d7c4e28Aa275D7D3fad': 1,
  },
  [PresetTypedChainId.DemeterOrbit]: {
    '0x765A081120c1760d72D09d7c4e28Aa275D7D3fad': 1,
  },
  [PresetTypedChainId.TangleTestnet]: {
    '0x765A081120c1760d72D09d7c4e28Aa275D7D3fad': 82_000,
  },

  ...localAnchorRecord,

  // Substrate
  [PresetTypedChainId.LocalTangleStandalone]: {
    '1': NaN,
  },
};

export const parsedAnchorConfig = Object.keys(anchorDeploymentBlock).reduce(
  (acc, typedChainId) => {
    const addresses = Object.keys(anchorDeploymentBlock[+typedChainId]);
    if (addresses && addresses.length > 0) {
      acc[+typedChainId] = addresses;
    }
    return acc;
  },
  {} as Record<number, string[]>
);

export const getAnchorDeploymentBlockNumber = (
  chainIdType: number,
  contractAddress: string
): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};
