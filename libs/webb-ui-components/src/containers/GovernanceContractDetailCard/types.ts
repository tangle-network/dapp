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

  /**
   * All the chain options to be be chosen
   */
  typedChainIdSelections: number[];
}

export interface GovernanceFncCallerProps {
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

  /**
   * Is the function allowed to be called
   */
  isDisabled?: boolean;

  /**
   * Warning text at the bottom of the component
   */
  warningText?: string;
}
