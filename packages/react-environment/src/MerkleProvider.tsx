import { useMerkle } from '@webb-dapp/react-hooks';
import MerkleTree from '@webb-tools/sdk-merkle/tree';
import React, { FC, ReactNode } from 'react';

export interface MerkleContextData {
  initialized: boolean;
  loading: boolean;
  merkle: MerkleTree | null;
  shouldDestroy: false;
  init(): Promise<void>;
  generatingBP: boolean;
  restarting: boolean;
  restart(): Promise<void>;
}

// ensure that merkle always exist
export const MerkleContext = React.createContext<MerkleContextData>({} as MerkleContextData);

interface Props {
  children: ReactNode;
  depth?: number;
}

/**
 * @name MerkleProvider
 * @description context provider to support merkletree.
 */
export const MerkleProvider: FC<Props> = ({ children, depth = 32 }) => {
  const merkleResults = useMerkle({ depth });

  return <MerkleContext.Provider value={merkleResults}>{children}</MerkleContext.Provider>;
};
