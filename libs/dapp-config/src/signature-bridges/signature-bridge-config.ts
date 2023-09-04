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
    '0x9b5404eBc174a7eE36b0d248b2735382B320EC76':
      '0x0447bc20C5360D62e73dB3Ea0bB1848EBbdc5ee6',
  },
  [PresetTypedChainId.AthenaOrbit]: {
    '0x9b5404eBc174a7eE36b0d248b2735382B320EC76':
      '0x0447bc20C5360D62e73dB3Ea0bB1848EBbdc5ee6',
  },
  [PresetTypedChainId.DemeterOrbit]: {
    '0x9b5404eBc174a7eE36b0d248b2735382B320EC76':
      '0x0447bc20C5360D62e73dB3Ea0bB1848EBbdc5ee6',
  },
  [PresetTypedChainId.TangleTestnet]: {
    '0x9b5404eBc174a7eE36b0d248b2735382B320EC76':
      '0x0447bc20C5360D62e73dB3Ea0bB1848EBbdc5ee6',
  },

  ...localAnchorRecord,

  // Substrate
  [PresetTypedChainId.LocalTangleStandalone]: {
    '1': '',
  },
};
