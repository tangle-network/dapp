import { WebbComponentBase } from '../../types';
import React from 'react';
import { ChainGroup } from '@webb-tools/dapp-config/chains';

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
