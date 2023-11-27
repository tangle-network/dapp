import type { Abi } from 'viem';

export interface GovernanceFormProps {
  abi: Abi;
  typedChainIdSelections: number[];
  governanceFncNames: string[];
}

export type FunctionInfoType = {
  fncName: string;
  fncParams: {
    name?: string;
    type: string;
  }[];
};
