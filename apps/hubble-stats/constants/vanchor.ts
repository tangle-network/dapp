import { PresetTypedChainId } from '@webb-tools/dapp-types';

import { PoolType } from '../components/PoolTypeChip/types';

export type VAnchorType = {
  address: string;
  poolType: PoolType;
  fungibleTokenName: string;
  fungibleTokenSymbol: string;
  fungibleTokenAddress: string;
  supportedChains: PresetTypedChainId[];
};

export type VAnchorMapType = Record<
  string,
  {
    poolType: PoolType;
    fungibleTokenName: string;
    fungibleTokenSymbol: string;
    fungibleTokenAddress: string;
    supportedChains: PresetTypedChainId[];
  }
>;

export const VANCHORS_MAP: VAnchorMapType = {
  ['0x7aA556dD0AF8bed063444E14A6A9af46C9266973']: {
    poolType: 'single',
    fungibleTokenName: 'Webb Wrapped tTNT',
    fungibleTokenSymbol: 'webbtTNT',
    fungibleTokenAddress: '0x58BA29259Aab901179A07899235e3CB88afE9079',
    supportedChains: [
      PresetTypedChainId.HermesOrbit,
      PresetTypedChainId.DemeterOrbit,
      PresetTypedChainId.AthenaOrbit,
    ],
  },
};

export const VANCHOR_ADDRESSES = Object.keys(VANCHORS_MAP);
