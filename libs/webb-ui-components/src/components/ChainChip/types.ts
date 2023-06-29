import { WebbComponentBase } from '../../types';
import React from 'react';
import { ChainBase } from '@webb-tools/dapp-config/chains';

export type ChainChipClassNames = {
  [key in ChainBase]: {
    default: string;
  };
};

export interface ChainChipProps extends WebbComponentBase {
  chainType: ChainBase;
  chainName: string;
  title?: string;
  children?: React.ReactNode;
}
