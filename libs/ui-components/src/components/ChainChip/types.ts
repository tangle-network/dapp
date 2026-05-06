import type { ChainGroup } from '@tangle-network/dapp-config/chains/chain-config.interface';
import type { ReactNode } from 'react';
import type { ComponentBase } from '../../types';

export type ChainChipClassNames = {
  [key in ChainGroup]: {
    default: string;
  };
};

export interface ChainChipProps extends ComponentBase {
  chainType: ChainGroup;
  chainName: string;
  title?: string;
  children?: ReactNode;
}
