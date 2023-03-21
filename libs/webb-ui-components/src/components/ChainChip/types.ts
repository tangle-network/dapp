import { WebbComponentBase } from '../../types';
import React from 'react';

export type ChainType =
  | 'polygon'
  | 'ethereum'
  | 'optimism'
  | 'kusama'
  | 'moonbeam'
  | 'polkadot'
  | 'arbitrum'
  | 'avalanche'
  | 'tangle'
  | 'scroll'
  | 'webb-dev';

export type ChainChipClassNames = {
  [key in ChainType]: {
    default: string;
  };
};

export interface ChainChipProps extends WebbComponentBase {
  type: ChainType;
  name: string;
  children?: React.ReactNode;
}
