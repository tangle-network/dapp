import type { Abi } from 'viem';

export interface GovernanceFormProps {
  abi: Abi;
  typedChainIdSelections: number[];
  governanceFncNames: string[];
}
