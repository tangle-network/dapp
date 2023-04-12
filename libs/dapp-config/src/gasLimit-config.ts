import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { BigNumber } from 'ethers';

export type GasLimitConfigType = {
  [typedChainId: number]: BigNumber;
};

const gasLimitConfig: GasLimitConfigType = {
  [PresetTypedChainId.OptimismTestnet]: BigNumber.from(2000000),
  [PresetTypedChainId.PolygonTestnet]: BigNumber.from(2000000),
  [PresetTypedChainId.ArbitrumTestnet]: BigNumber.from(20000000),
  [PresetTypedChainId.Sepolia]: BigNumber.from(2000000),
  [PresetTypedChainId.MoonbaseAlpha]: BigNumber.from(2000000),
  [PresetTypedChainId.Goerli]: BigNumber.from(2000000),
  [PresetTypedChainId.AvalancheFuji]: BigNumber.from(2000000),
  [PresetTypedChainId.ScrollAlpha]: BigNumber.from(2000000),
};

export default gasLimitConfig;
