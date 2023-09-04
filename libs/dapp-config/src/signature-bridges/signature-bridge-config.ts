import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { LOCALNET_CHAIN_IDS } from '../chains';

type AnchorWithSignatureBridgeMapType = Record<string, string>;
type ChainWithAnchorsMapType = Record<number, AnchorWithSignatureBridgeMapType>;

const localAnchorRecord = process.env.BRIDGE_DAPP_LOCAL_ORBIT_ANCHOR_ADDRESS
  ? LOCALNET_CHAIN_IDS.reduce<ChainWithAnchorsMapType>((acc, chainId) => {
      const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
      const anchorAddress: string = process.env
        .BRIDGE_DAPP_LOCAL_ORBIT_ANCHOR_ADDRESS as string;

      acc[typedChainId] = {
        [anchorAddress]: '',
      };

      return acc;
    }, {})
  : {};

export const anchorSignatureBridge: ChainWithAnchorsMapType = {
  // EVM
  [PresetTypedChainId.ArbitrumTestnet]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },
  [PresetTypedChainId.Goerli]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },
  [PresetTypedChainId.Sepolia]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },
  [PresetTypedChainId.PolygonTestnet]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },
  [PresetTypedChainId.MoonbaseAlpha]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },
  [PresetTypedChainId.AvalancheFuji]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },
  [PresetTypedChainId.ScrollAlpha]: {
    '0x38e7aa90c77f86747fab355eecaa0c2e4c3a463d': '',
  },

  [PresetTypedChainId.HermesOrbit]: {
    '0x7aA556dD0AF8bed063444E14A6A9af46C9266973':
      '0x7C6C8Ed46a66Dac4132784c0a9C707e83bAccA05',
  },
  [PresetTypedChainId.AthenaOrbit]: {
    '0x7aA556dD0AF8bed063444E14A6A9af46C9266973':
      '0x7C6C8Ed46a66Dac4132784c0a9C707e83bAccA05',
  },
  [PresetTypedChainId.DemeterOrbit]: {
    '0x7aA556dD0AF8bed063444E14A6A9af46C9266973':
      '0x7C6C8Ed46a66Dac4132784c0a9C707e83bAccA05',
  },
  [PresetTypedChainId.TangleTestnet]: {
    '0x7aA556dD0AF8bed063444E14A6A9af46C9266973':
      '0x7C6C8Ed46a66Dac4132784c0a9C707e83bAccA05',
  },

  ...localAnchorRecord,

  // Substrate
  [PresetTypedChainId.LocalTangleStandalone]: {
    '1': '',
  },
};
