import { randEthereumAddress, randFloat, randIp, randNumber } from '@ngneat/falso';
import { useCallback, useState } from 'react';

export interface DKGSigner {
  voter: string;
  ip: string;
  uptime: number;
  reward: number;
}

export interface DKGEggnetData {
  blockNumber: number;
  signatureThreshold: number;
  keygenThreshold: number;
  authorities: number;
  proposerCount: number;
  signedProposals: number;
  unsignedProposalQueue: number;
  dkgSigners: DKGSigner[];
}

const initialState: DKGEggnetData = {
  blockNumber: 0,
  signatureThreshold: 0,
  keygenThreshold: 0,
  authorities: 0,
  proposerCount: 0,
  signedProposals: 0,
  unsignedProposalQueue: 0,
  dkgSigners: [],
};

export function useDKGEggnetStats() {
  const [state, setState] = useState<DKGEggnetData>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(() => {
    setIsLoading(true);

    return new Promise<void>(() =>
      setTimeout(() => {
        setState({
          blockNumber: randNumber({ min: 50000, max: 100000, precision: 10 }),
          signatureThreshold: randNumber({ min: 10, max: 100, precision: 10 }),
          keygenThreshold: randNumber({ min: 10, max: 100, precision: 10 }),
          authorities: randNumber({ min: 10, max: 100, precision: 10 }),
          proposerCount: randNumber({ min: 10, max: 100, precision: 10 }),
          signedProposals: randNumber({ min: 10, max: 100, precision: 10 }),
          unsignedProposalQueue: randNumber({ min: 10, max: 100, precision: 10 }),
          dkgSigners: Array.from(Array(randNumber({ min: 20, max: 50 }))).map(() => ({
            voter: randEthereumAddress(),
            ip: randIp(),
            uptime: randNumber({ min: 80, max: 100 }),
            reward: randFloat({ min: 0, max: 5, fraction: 5 }),
          })),
        } as unknown as DKGEggnetData);

        setIsLoading(false);
      }, 300)
    );
  }, []);

  return {
    data: state,
    fetchData,
    isLoading,
  };
}
