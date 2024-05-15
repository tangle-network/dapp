import type { ChainGroup } from '@webb-tools/dapp-config/chains/chain-config.interface.js';
import React from 'react';
import type { WebbComponentBase } from '../../types/index.js';

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
