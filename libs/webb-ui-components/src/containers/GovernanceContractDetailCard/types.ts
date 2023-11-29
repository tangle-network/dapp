import type { Abi } from 'viem';

export interface ContractDetailCardProps {
  /**
   * Contract metadata (address, wrapping fees, etc, ...)
   */
  metadata: {
    title: string;
    detailsCmp: React.ReactNode;
  }[];

  /**
   * The ABI of the smart contract
   */
  abi: Abi;

  /**
   * List of all the governance function of the smart contract
   */
  governanceFncNames: string[];
}

export type FunctionInfoType = {
  /**
   * The name of the function
   */
  fncName: string;

  /**
   * The list of all the parameters of the function
   */
  fncParams: {
    name?: string;
    type: string;
  }[];
};
