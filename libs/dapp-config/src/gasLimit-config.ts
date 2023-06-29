import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { BigNumber } from 'ethers';

export type GasLimitConfigType = {
  [typedChainId: number]: BigNumber;
};

export const DEFAULT_GAS_LIMIT = BigNumber.from(20000000);

const gasLimitConfig: GasLimitConfigType = {
  // EVM
  [PresetTypedChainId.OptimismTestnet]: BigNumber.from(2000000),
  [PresetTypedChainId.PolygonTestnet]: BigNumber.from(2000000),
  [PresetTypedChainId.ArbitrumTestnet]: BigNumber.from(20000000),
  [PresetTypedChainId.Sepolia]: BigNumber.from(2000000),
  [PresetTypedChainId.MoonbaseAlpha]: BigNumber.from(2000000),
  [PresetTypedChainId.Goerli]: BigNumber.from(2000000),
  [PresetTypedChainId.AvalancheFuji]: BigNumber.from(2000000),
  [PresetTypedChainId.ScrollAlpha]: BigNumber.from(2000000),

  // Orbit
  [PresetTypedChainId.HermesOrbit]: BigNumber.from(2000000), // TODO: benchmark gas limit
  [PresetTypedChainId.AthenaOrbit]: BigNumber.from(2000000), // TODO: benchmark gas limit
  [PresetTypedChainId.DemeterOrbit]: BigNumber.from(2000000), // TODO: benchmark gas limit

  // Substrate
  // On substrate we don't use the gas amount, we use the partial fee instead
  [PresetTypedChainId.ProtocolSubstrateStandalone]: BigNumber.from(
    '10840000100000000000'
  ),
  [PresetTypedChainId.LocalTangleStandalone]: BigNumber.from(
    '10840000100000000000'
  ),
};

export default gasLimitConfig;
