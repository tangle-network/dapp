import type { ChainGroup } from '@webb-tools/dapp-config/chains/chain-config.interface';
import React from 'react';
import type { WebbComponentBase } from '../../types';

export type ChainChipClassNames = {
  [key in ChainGroup]: {
    default: string;
  };
};

export interface ChainChipProps extends WebbComponentBase {
  chainType: ChainGroup;
  chainName: string;
  title?: string;
  children?: React.ReactNode;
}
